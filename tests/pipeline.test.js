'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path');
const M=require('../model.js'),F=require('../file-tracking.js'),P=require('../tools/project-pipeline.js');
async function fixture(t) {
  const parent=await fs.realpath(os.tmpdir()),dir=await fs.mkdtemp(path.join(parent,'ccm-pipeline-test-'));
  t.after(async()=>{assert.equal(path.dirname(dir),parent);assert.ok(path.basename(dir).startsWith('ccm-pipeline-test-'));await fs.rm(dir,{recursive:true,force:true});});
  const p=M.createProject({name:'Expansión de prueba',client:'Cliente',startDate:'2026-09-17',driveUrl:'https://drive.google.com/drive/folders/prueba'},'Pruebas');
  const file=path.join(dir,p.id+'.json');await fs.writeFile(file,JSON.stringify(p));
  return {dir,p,file};
}
async function response(run,edit=()=>{}) {
  const value=M.parseJSON(await fs.readFile(run.input,'utf8'));
  value.analysis.provider='Agente de prueba';value.analysis.reviewedAt=M.now();value.analysis.coverage.folderUrl=value.info.driveUrl;
  await edit(value);await fs.writeFile(run.response,JSON.stringify(value));return value;
}
test('Pipeline completo: preparar, analizar, aplicar y reutilizar en la segunda revisión',async t=>{
  const {dir,p,file}=await fixture(t),run=await P.prepare(p.info.name,dir);
  assert.equal((await P.status(dir)).projects[0].lock.runId,run.runId);
  await assert.rejects(()=>P.prepare(p.id,dir),/en curso/);
  const initial=await response(run,value=>{
    const entry=F.blank('file-one',p.info.driveUrl);Object.assign(entry,{fileName:'Motor.pdf',path:'Ingeniería/Motor.pdf',driveFileId:'drive-1',lastSeenAt:M.now()});entry.observed.version='1';
    value.processedFiles.push(F.complete(entry,'Agente de prueba'));value.analysis.coverage.discovered=1;value.analysis.coverage.read=1;
    Object.assign(value.checklist.find(item=>item.id==='r3-01'),{state:'available',value:'400 V',evidence:[{id:'ev-one',documentId:'',fileName:'Motor.pdf',path:entry.path,revision:'0',locator:'Página 2',quote:'Tensión: 400 V',url:''}]});
    value.info.technology='ccm_vdf';value.info.offerStatus='reference';value.info.offerReason='Oferta referencial según antecedentes.';
  });
  const result=await P.apply(run.runId,dir),next=M.parseJSON(await fs.readFile(file,'utf8'));
  assert.equal(result.version,2);assert.equal(next.history.at(-1).origin,'ai_automation');assert.equal(next.reviews[0].mode,'automatic');assert.equal(next.checklist.find(item=>item.id==='r3-01').value,'400 V');assert.equal(next.info.offerStatus,'reference');assert.equal(F.evaluate(next.processedFiles[0],p.info.driveUrl).action,'skip');assert.equal(next.reviewContext,null);assert.equal((await P.status(dir)).projects[0].lock,null);
  const run2=await P.prepare(p.id,dir);
  await response(run2,value=>{value.analysis.coverage.read=0;value.analysis.coverage.reused=1;value.analysis.summary='Inventario simulado: sin cambios.';});
  await P.apply(run2.runId,dir);const again=M.parseJSON(await fs.readFile(file,'utf8'));
  assert.equal(again.version,3);assert.equal(again.reviews.length,2);assert.deepEqual(again.processedFiles[0].processing,initial.processedFiles[0].processing);assert.deepEqual(again.history.slice(0,next.history.length),next.history);
});
test('Pipeline conserva ajustes manuales, identidad y consultas aunque la IA los cambie',async t=>{
  const {dir,p,file}=await fixture(t);
  let manual=M.updateChecklist(p,'r3-01',{state:'missing',notes:'Confirmado por persona',manualLock:true},'Revisado','Ana');
  manual=M.updateInfo(manual,{offerStatus:'review',offerReason:'Revisión manual'},'Decisión','Ana');
  manual=M.upsertRecord(manual,'queries',{id:'q-one',title:'Duda',question:'Confirmar tensión',assignedTo:'',status:'open',createdAt:M.now(),createdBy:'Ana',relatedChecklistIds:[],evidence:[],messages:[],resolution:'',closedAt:null},'Consulta','Ana');
  await fs.writeFile(file,JSON.stringify(manual));const run=await P.prepare(p.id,dir);
  await response(run,value=>{value.checklist.find(item=>item.id==='r3-01').notes='Cambio IA';value.info.client='Otro';value.info.offerStatus='reference';value.queries[0].status='closed';value.queries[0].resolution='Resuelta por IA';value.queries[0].closedAt=M.now();});
  await P.apply(run.runId,dir);const next=M.parseJSON(await fs.readFile(file,'utf8'));
  assert.equal(next.info.client,p.info.client);assert.equal(next.info.offerStatus,'review');assert.equal(next.checklist.find(item=>item.id==='r3-01').notes,'Confirmado por persona');assert.equal(next.queries[0].status,'open');assert.ok(next.reviews[0].decisions.every(item=>!item.accepted));
});
test('Pipeline permite completar una relectura manual y conserva su identidad',async t=>{
  const {dir,p,file}=await fixture(t);let entry=F.blank('file-one',p.info.driveUrl);Object.assign(entry,{fileName:'Plano.pdf',path:'Plano.pdf',driveFileId:'id-1'});entry.observed.version='1';entry=F.complete(entry,'Ana','2026-09-20T10:00:00Z');entry.processing.forceReview=true;
  const manual=M.upsertRecord(p,'processedFiles',entry,'Releer','Ana');await fs.writeFile(file,JSON.stringify(manual));const run=await P.prepare(p.id,dir);
  await response(run,value=>{value.processedFiles[0]=F.complete(value.processedFiles[0],'Agente de prueba');});await P.apply(run.runId,dir);
  const next=M.parseJSON(await fs.readFile(file,'utf8'));assert.equal(next.processedFiles[0].processing.forceReview,false);assert.equal(next.processedFiles[0].driveFileId,'id-1');
});
test('Una respuesta inválida no altera el padre; permite corregir y aplicar',async t=>{
  const {dir,p,file}=await fixture(t),run=await P.prepare(p.id,dir),before=await fs.readFile(file,'utf8');
  await fs.writeFile(run.response,'{"json":');await assert.rejects(()=>P.apply(run.runId,dir));assert.equal(await fs.readFile(file,'utf8'),before);
  await response(run,value=>{value.checklist[0].label='Requisito cambiado';});await assert.rejects(()=>P.apply(run.runId,dir),/definición/);assert.equal(await fs.readFile(file,'utf8'),before);
  await response(run);await P.apply(run.runId,dir);assert.equal(M.parseJSON(await fs.readFile(file,'utf8')).version,2);
});
test('Revisión obsoleta se rechaza y abort libera bloqueo sin cambiar datos',async t=>{
  const {dir,p,file}=await fixture(t),run=await P.prepare(p.id,dir);await response(run);
  const external=M.addNote(p,'Cambio externo',[],'Ana');await fs.writeFile(file,JSON.stringify(external));await assert.rejects(()=>P.apply(run.runId,dir),/cambió/);await P.abort(run.runId,dir);
  assert.deepEqual(M.parseJSON(await fs.readFile(file,'utf8')),external);assert.equal((await P.status(dir)).projects[0].lock,null);
});
test('Identidad, ruta y cobertura incorrectas no se aplican; proyectos cerrados se rechazan',async t=>{
  const {dir,p,file}=await fixture(t),run=await P.prepare(p.id,dir);
  await response(run,value=>{value.analysis.coverage.folderUrl='https://example.com/otra';});await assert.rejects(()=>P.apply(run.runId,dir),/carpeta de Drive/);
  await assert.rejects(()=>P.apply('../outside',dir),/Identificador/);await P.abort(run.runId,dir);
  await fs.writeFile(file,JSON.stringify(M.closeProject(p,{date:'2026-09-21',outcome:'sent',reason:'Prueba',actor:'Ana'})));await assert.rejects(()=>P.prepare(p.id,dir),/cerrado/);
});
test('Nombres repetidos exigen ID y JSON padre duplicados se detectan antes de escribir',async t=>{
  const {dir,p}=await fixture(t),second=M.createProject(p.info,'Prueba');await fs.writeFile(path.join(dir,second.id+'.json'),JSON.stringify(second));
  await assert.rejects(()=>P.prepare(p.info.name,dir),/Nombre repetido/);await fs.writeFile(path.join(dir,'copia.json'),JSON.stringify(p));await assert.rejects(()=>P.prepare(p.id,dir),/mismo ID/);
});
