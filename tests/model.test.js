'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const M=require('../model.js'),S=require('../storage.js');
const fresh=()=>M.createProject({client:'Cliente de prueba',name:'Proyecto de prueba',startDate:'2026-09-17'},'Pruebas');
const ev=(doc='')=>({id:'ev-one',documentId:doc,fileName:'Unilineal Rev 1.pdf',path:'Ingeniería/Unilineal Rev 1.pdf',revision:'1',locator:'Página 2, barra principal',quote:'Tensión nominal: 400 V',url:''});
const doc=(id='doc-one',revision='1')=>({id,name:`Unilineal Rev ${revision}.pdf`,path:'Ingeniería',familyId:'unilineal',revision,url:'',notes:'',mimeType:'application/pdf',readStatus:'read'});
const query=()=>({id:'qry-one',title:'Confirmar tensión',question:'¿Se confirma 400 V?',assignedTo:'Cliente',status:'open',resolution:'',closedAt:null,createdAt:M.now(),createdBy:'Pruebas',relatedChecklistIds:['r3-01'],evidence:[],messages:[]});
class MemoryStorage { constructor(){this.items=new Map();}get length(){return this.items.size;}key(i){return [...this.items.keys()][i];}getItem(k){return this.items.get(k)??null;}setItem(k,v){this.items.set(k,String(v));} }
function folder(initial={}) {
  const files=new Map(Object.entries(initial).map(([name,content])=>[name,{kind:'file',name,content,async getFile(){return {size:this.content.length,text:async()=>this.content};},async createWritable(){let next;return {write:async value=>{next=value;},close:async()=>{this.content=next;},abort:async()=>{}};}}]));
  return {name:'Pruebas',files,async *entries(){yield*files.entries();},async getFileHandle(name,opts={}){if(!files.has(name)){if(!opts.create)throw Object.assign(new Error('Missing'),{name:'NotFoundError'});files.set(name,folder({[name]:''}).files.get(name));}return files.get(name);}};
}
test('Proyecto vacío: 145 controles, cinco pilares, ninguna evidencia ni datos ficticios',()=>{
  const p=M.createProject();assert.equal(p.checklist.length,145);assert.equal(new Set(p.checklist.map(x=>x.pillar)).size,5);assert.equal(p.info.name,'');assert.ok(p.checklist.every(x=>x.state==='unreviewed'&&!x.value&&!x.evidence.length));for(const key of M.COLLECTIONS)assert.equal(p[key].length,0);assert.equal(M.progress(p),0);
});
test('Disponibilidad requiere evidencia completa y no aplica requiere justificación',()=>{
  const p=fresh();assert.throws(()=>M.updateChecklist(p,'r3-01',{state:'available',value:'400 V'},'Verificado','Ana'),/evidencia/);assert.throws(()=>M.updateChecklist(p,'r3-01',{state:'not_applicable'},'Cambio','Ana'),/justifica/);
  const next=M.updateChecklist(p,'r3-01',{state:'available',value:'400 V',evidence:[ev()],manualLock:true},'Lectura de unilineal','Ana');assert.equal(next.version,2);assert.equal(p.checklist.find(x=>x.id==='r3-01').state,'unreviewed');assert.equal(next.history.at(-1).changes[0].before.state,'unreviewed');assert.equal(next.history.at(-1).changes[0].after.value,'400 V');
  const bad=M.clone(next);bad.checklist[0].page=23;assert.throws(()=>M.validateProject(bad),/definición/);
});
test('Referencias documentales y revisiones deben coincidir',()=>{
  let p=fresh();assert.throws(()=>M.updateChecklist(p,'r3-01',{state:'available',value:'400 V',evidence:[ev('missing')]},'Fuente','Ana'),/no registrado/);
  p=M.upsertRecord(p,'documents',doc('d0','0'),'Registro','Ana');p=M.upsertRecord(p,'documents',doc('d1','1'),'Registro','Ana');
  const revision={id:'r-one',familyId:'unilineal',fromRevision:'0',toRevision:'1',fromDocumentId:'d0',toDocumentId:'d1',summary:'380 V a 400 V',justification:'Confirmación del cliente',justificationStatus:'documented',impact:'Recalcular equipos',evidence:[ev('d1')]};
  p=M.upsertRecord(p,'revisions',revision,'Comparación','Ana');assert.equal(p.revisions.length,1);assert.throws(()=>M.upsertRecord(p,'revisions',{...revision,toRevision:'2'},'Comparación','Ana'),/otra revisión/);
});
test('Días hábiles excluyen inicio, fines de semana y feriados sin duplicar fechas',()=>{
  const c=fresh().calendar;assert.equal(M.businessDaysBetween('2026-09-17','2026-09-21',c).days,1);assert.equal(M.businessDaysBetween('2026-09-17','2026-09-17',c).days,0);assert.equal(M.businessDaysBetween('2026-09-11','2026-09-14',c).days,1);
  c.holidays.push({...c.holidays.find(x=>x.date==='2026-09-18'),id:'duplicate-date'});assert.equal(M.businessDaysBetween('2026-09-17','2026-09-21',c).holidayDays,1);assert.throws(()=>M.businessDaysBetween('2026-09-21','2026-09-17',c),/anterior/);assert.equal(M.validDate('2025-02-29'),false);assert.equal(M.validDate('2024-02-29'),true);
  assert.deepEqual(M.businessDaysBetween('2026-12-31','2027-01-04',c).missingYears,[2027]);
});
test('Consultas conservan seguimientos, resolución y reaperturas',()=>{
  let p=M.upsertRecord(fresh(),'queries',query(),'Nueva consulta','Ana');p=M.queryMessage(p,'qry-one','Se consultó al cliente',[],'Ana');p=M.queryMessage(p,'qry-one','Cliente confirmó 400 V',[ev()],'Ana','closed');assert.equal(p.queries[0].status,'closed');assert.equal(p.queries[0].messages.length,2);assert.throws(()=>M.queryMessage(p,'qry-one','Otra',[],'Ana'),/estado/);
  p=M.queryMessage(p,'qry-one','Se recibió una contradicción',[],'Ana','reopened');assert.equal(p.queries[0].status,'open');assert.equal(p.queries[0].resolution,'');assert.equal(p.queries[0].messages.length,3);assert.equal(p.history.at(-1).changes[0].before.resolution,'Cliente confirmó 400 V');
});
test('Cerrar congela calendario y duración; reabrir conserva cierre anterior',()=>{
  let p=fresh();p=M.closeProject(p,{date:'2026-09-21',outcome:'sent',reason:'Oferta enviada',actor:'Ana'});assert.equal(M.elapsed(p,'2026-12-01').days,1);assert.equal(M.elapsed(p).frozen,true);assert.throws(()=>M.addNote(p,'Cambio',[],'Ana'),/cerrado/);const altered=M.clone(p);altered.lifecycle.closure.calculation.days=99;assert.throws(()=>M.validateProject(altered),/conteo/);
  p=M.reopenProject(p,'Cliente pidió ajuste','Ana');assert.equal(p.lifecycle.status,'active');assert.equal(p.history.at(-1).changes[0].before.closure.calculation.days,1);
});
test('El cierre exige cobertura del calendario; oferta firme exige resolver críticos',()=>{
  const p=fresh();p.calendar.coverage=[];assert.throws(()=>M.closeProject(p,{date:'2026-09-21',outcome:'sent',reason:'Cierre',actor:'Ana'}),/calendarios/);assert.throws(()=>M.updateInfo(p,{offerStatus:'firm'},'Oferta','Ana'),/críticos/);
});
test('Revisión IA permite aceptar diferencias, preservar bloqueos manuales e historial',async()=>{
  const p=M.updateChecklist(fresh(),'r3-01',{state:'available',value:'400 V',evidence:[ev()],manualLock:true},'Revisado','Ana');const incoming=await M.prepareReview(p);incoming.analysis.provider='Gemini';incoming.analysis.coverage={folderUrl:'',recursive:true,discovered:2,read:1,unreadable:['protegido.xlsx'],notes:'Acceso parcial'};incoming.analysis.summary='Un archivo sin acceso';incoming.checklist.find(x=>x.id==='r3-01').value='480 V';incoming.checklist.find(x=>x.id==='r1-01').state='missing';incoming.history=[];
  const review=await M.compareReview(p,incoming);assert.equal(review.changes.find(x=>x.id==='r3-01').locked,true);assert.ok(review.warnings.some(x=>x.includes('history')));
  const next=M.applyReview(p,review,review.changes.filter(x=>!x.locked).map(x=>x.key),'Ana');assert.equal(next.checklist.find(x=>x.id==='r3-01').value,'400 V');assert.equal(next.checklist.find(x=>x.id==='r1-01').state,'missing');assert.equal(next.history.length,p.history.length+1);assert.equal(next.reviews[0].decisions.find(x=>x.id==='r3-01').accepted,false);assert.equal(next.analysis.coverage.read,1);assert.throws(()=>M.applyReview(next,review,[],'Ana'),/cambió|procesada/);
});
test('Revisión obsoleta y cambio de definición se rechazan sin mutar proyecto',async()=>{
  const p=fresh(),incoming=await M.prepareReview(p),changed=M.addNote(p,'Cambio durante revisión',[],'Ana');await assert.rejects(()=>M.compareReview(changed,incoming),/versión anterior/);incoming.checklist[0].label='Cambiado';await assert.rejects(()=>M.compareReview(p,incoming),/definición/);
});
test('Selección IA parcial valida dependencias documentales antes de guardar',async()=>{
  const p=fresh(),incoming=await M.prepareReview(p);incoming.documents.push(doc());Object.assign(incoming.checklist.find(x=>x.id==='r3-01'),{state:'available',value:'400 V',evidence:[ev('doc-one')]});const review=await M.compareReview(p,incoming);assert.throws(()=>M.applyReview(p,review,['checklist:r3-01'],'Ana'),/no registrado/);const next=M.applyReview(p,review,review.changes.map(x=>x.key),'Ana');assert.equal(next.documents.length,1);assert.equal(next.checklist.find(x=>x.id==='r3-01').value,'400 V');
});
test('JSON seguro: tipos, IDs duplicados, enlaces y claves peligrosas',()=>{
  assert.throws(()=>M.parseJSON('{"__proto__":{}}'));assert.equal(M.safeURL('javascript:alert(1)'),'');const p=fresh();p.checklist[1].id=p.checklist[0].id;assert.throws(()=>M.validateProject(p),/duplicado/);assert.throws(()=>M.parseJSON('{bad}'));
});
test('Persistencia conserva un registro por proyecto y detecta edición entre pestañas',()=>{
  const memory=new MemoryStorage(),a=S.create(memory),b=S.create(memory),p=fresh();a.save(p);const first=M.addNote(p,'Cambio A',[],'Ana');a.save(first,p.version);assert.throws(()=>b.save(M.addNote(p,'Cambio B',[],'B'),p.version),/Otra pestaña/);assert.equal(a.list().projects.length,1);assert.equal(a.get(p.id).version,2);memory.setItem(S.PREFIX+'bad','{');assert.equal(a.list().errors.length,1);assert.equal(memory.length,2);
});
test('Fallo de almacenamiento no simula éxito',()=>{
  const memory=new MemoryStorage();memory.setItem=()=>{throw new Error('QuotaExceededError');};assert.throws(()=>S.create(memory).save(fresh()),/No se pudo guardar/);
});
test('Carpeta guarda JSON completo, conserva archivos externos y permite revisión aparte',async()=>{
  const p=fresh(),dir=folder(),s=S.create(new MemoryStorage());s.save(p);await s.connect(dir);await s.mirror(p);const handle=dir.files.get(`${p.id}.json`);assert.equal(JSON.parse(handle.content).id,p.id);
  const review=await M.prepareReview(p);await s.acknowledgeExternal(p.id,`${p.id}.revision-ia.json`,JSON.stringify(review));const next=M.addNote(p,'Segundo cambio',[],'Ana');s.save(next,1);await s.mirror(next);assert.equal(JSON.parse(handle.content).version,2);
  handle.content='archivo cambiado externamente';await assert.rejects(()=>s.mirror(next),/fuera del dashboard/);assert.equal(handle.content,'archivo cambiado externamente');
});
test('Conectar carpeta con otra versión no sobrescribe ni crea duplicado',async()=>{
  const p=fresh(),external=M.addNote(p,'Cambio externo',[],'B'),dir=folder({'proyecto.json':JSON.stringify(external)}),s=S.create(new MemoryStorage());s.save(p);const report=await s.connect(dir);assert.equal(report.conflicts.length,1);await assert.rejects(()=>s.mirror(p),/conflicto/);assert.equal(dir.files.size,1);
  s.save(external,1);await s.acknowledgeExternal(p.id,'proyecto.json',JSON.stringify(external));await s.mirror(external);assert.equal(dir.files.size,1);assert.equal(JSON.parse(dir.files.get('proyecto.json').content).version,2);
});

test('Pipeline: sigue versiones posteriores, rechaza ramas y archivos repetidos',async()=>{
  const p=fresh(),dir=folder({[p.id+'.json']:JSON.stringify(p)}),s=S.create(new MemoryStorage());
  s.save(p);await s.connect(dir,{followExternal:true});
  const next=M.addNote(p,'Actualización externa',[],'Agente');dir.files.get(p.id+'.json').content=JSON.stringify(next);
  assert.deepEqual((await s.refresh()).updated,[p.id]);assert.equal(s.get(p.id).version,2);
  const branch=M.addNote(p,'Otra rama',[],'Otro');dir.files.get(p.id+'.json').content=JSON.stringify(branch);
  assert.equal((await s.refresh()).conflicts.length,1);assert.equal(s.get(p.id).history.at(-1).reason,'Actualización externa');
  await assert.rejects(()=>s.beforeChange(p.id),/incompatibles/);
  dir.files.get(p.id+'.json').content=JSON.stringify(next);await s.refresh();
  const third=M.addNote(next,'Tercero',[],'Agente');dir.files.get(p.id+'.json').content=JSON.stringify(third);
  const duplicate=await dir.getFileHandle('duplicado.json',{create:true});duplicate.content=JSON.stringify(third);
  assert.equal((await s.refresh()).conflicts.length,1);assert.equal(s.get(p.id).version,2);
});
test('Pipeline: bloqueo activo y JSON truncado impiden editar sin perder la copia local',async()=>{
  const p=fresh(),dir=folder({[p.id+'.json']:JSON.stringify(p)}),s=S.create(new MemoryStorage());
  await s.connect(dir,{followExternal:true});await dir.getFileHandle(p.id+'.lock',{create:true});
  await assert.rejects(()=>s.beforeChange(p.id),/agente/);await assert.rejects(()=>s.mirror(p),/agente/);
  dir.files.delete(p.id+'.lock');dir.files.get(p.id+'.json').content='{';
  assert.equal((await s.refresh()).errors.length,1);await assert.rejects(()=>s.beforeChange(p.id),/archivo cambió/);assert.equal(s.get(p.id).version,1);
});
