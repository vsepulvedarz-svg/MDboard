'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const M=require('../model.js'),F=require('../file-tracking.js'),prompt=require('../review-prompt.js');
const folder='https://drive.google.com/drive/folders/project';
const fresh=()=>M.createProject({name:'Incremental',driveUrl:folder},'Pruebas');
function file(){const entry=F.blank('file_1',folder);Object.assign(entry,{fileName:'Memoria.pdf',driveFileId:'drive_123',path:'Ingeniería/Memoria.pdf',url:'https://drive.google.com/file/d/drive_123/view',lastSeenAt:'2026-09-21T10:00:00Z'});Object.assign(entry.observed,{modifiedTime:'2026-09-20T10:00:00Z',sizeBytes:2048,version:'12'});return entry;}
const processed=()=>F.complete(file(),'Gemini','2026-09-21T10:01:00Z');
test('Estado vacío compatible y registro manual conservado en JSON e historial',()=>{
 let p=fresh();assert.deepEqual(p.processedFiles,[]);p=M.upsertRecord(p,'processedFiles',processed(),'Lectura verificada','Ana');M.validateProject(M.parseJSON(JSON.stringify(p)));assert.equal(p.processedFiles[0].folderUrl,folder);assert.equal(p.history.at(-1).changes[0].after.path,'Ingeniería/Memoria.pdf');assert.equal(F.summary(p).skip,1);
});
test('Sin cambios permite reutilizar; un cambio de versión, fecha, tamaño o huella exige leer',()=>{
 const original=processed();assert.equal(F.evaluate(original,folder).action,'skip');
 for(const [key,value] of [['version','13'],['modifiedTime','2026-09-21T11:00:00Z'],['sizeBytes',2049]]){const altered=M.clone(original);altered.observed[key]=value;assert.equal(F.evaluate(altered,folder).action,'read',key);assert.equal(altered.processing.fingerprint[key],original.observed[key]);}
 const hashed=file();hashed.observed=F.metadata();hashed.observed.checksumAlgorithm='sha256';hashed.observed.checksum='a'.repeat(64);const read=F.complete(hashed,'Gemini');assert.equal(F.evaluate(read,folder).action,'skip');read.observed.checksum='b'.repeat(64);assert.equal(F.evaluate(read,folder).action,'read');
});
test('Nunca omite archivos nuevos, parciales, fallidos ni forzados',()=>{
 for(const status of ['pending','partial','failed']){const entry=file();entry.processing.status=status;assert.equal(F.evaluate(entry,folder).action,'read');}
 const entry=processed();entry.processing.forceReview=true;assert.equal(F.evaluate(entry,folder).action,'read');
});
test('Renombrar mismo ID conserva reutilización; mismo nombre con otro ID requiere leer',()=>{
 const entry=processed();entry.path='Nueva subcarpeta/Memoria renombrada.pdf';entry.fileName='Memoria renombrada.pdf';assert.equal(F.evaluate(entry,folder).action,'skip');entry.driveFileId='drive_456';assert.equal(F.evaluate(entry,folder).action,'read');
});
test('Identidad, metadatos o carpeta sin verificar nunca permiten omitir lectura',()=>{
 const entry=processed();assert.equal(F.evaluate(entry,'https://drive.google.com/drive/folders/other').action,'verify');entry.observed.version='';assert.equal(F.evaluate(entry,folder).action,'verify');
 const weak=file();weak.observed=F.metadata();weak.observed.sizeBytes=123;assert.equal(F.evaluate(F.complete(weak,'Chat'),folder).action,'verify');weak.observed.modifiedTime='2026-09-20T10:00:00Z';assert.equal(F.evaluate(F.complete(weak,'Chat'),folder).action,'skip');
 weak.driveFileId='';weak.url='';assert.equal(F.evaluate(F.complete(weak,'Chat'),folder).action,'verify');
});
test('Google Docs puede comparar versión sin inventar tamaño o huella',()=>{
 const entry=file();entry.observed=F.metadata();entry.observed.version='42';const read=F.complete(entry,'Chat');assert.equal(F.evaluate(read,folder).action,'skip');read.observed.version='43';assert.equal(F.evaluate(read,folder).action,'read');
});
test('Archivo no localizado o retirado permanece en el inventario',()=>{
 for(const availability of ['not_seen','removed']){const entry=processed();entry.availability=availability;const p=M.upsertRecord(fresh(),'processedFiles',entry,'Archivo no disponible','Ana');assert.equal(F.summary(p).unavailable,1);assert.equal(p.processedFiles[0].processing.status,'processed');}
});
test('Valida fechas, huellas, referencias, duplicados y datos de lectura completa',()=>{
 let p=fresh(),entry=file();entry.processing.status='processed';assert.throws(()=>M.upsertRecord(p,'processedFiles',entry,'Registro','Ana'),/responsable|Responsable|lectura completa/);
 entry=processed();entry.observed.checksum='inventado';assert.throws(()=>M.upsertRecord(p,'processedFiles',entry,'Registro','Ana'),/Huella/);
 entry=processed();entry.documentId='inexistente';assert.throws(()=>M.upsertRecord(p,'processedFiles',entry,'Registro','Ana'),/no registrado/);
 p=M.upsertRecord(p,'processedFiles',processed(),'Registro','Ana');assert.throws(()=>M.upsertRecord(p,'processedFiles',{...processed(),id:'duplicate'},'Registro','Ana'),/duplicado/);
});
test('Revisión incremental: importar observación nueva conserva la versión procesada',async()=>{
 const p=M.upsertRecord(fresh(),'processedFiles',processed(),'Registro','Ana'),incoming=await M.prepareReview(p);incoming.processedFiles[0].observed.version='13';incoming.analysis.coverage={folderUrl:folder,recursive:true,discovered:1,read:0,reused:0,unreadable:[],notes:'Versión nueva sin leer'};
 const diff=await M.compareReview(p,incoming),next=M.applyReview(p,diff,diff.changes.map(x=>x.key),'Ana');assert.equal(next.processedFiles[0].processing.fingerprint.version,'12');assert.equal(F.summary(next).read,1);assert.equal(next.history.at(-1).changes[0].before.observed.version,'12');
});
test('IA no borra archivos omitidos y registra reutilización sin falsear fecha de lectura',async()=>{
 const p=M.upsertRecord(fresh(),'processedFiles',processed(),'Registro','Ana'),incoming=await M.prepareReview(p);incoming.processedFiles=[];incoming.analysis.coverage={folderUrl:folder,recursive:false,discovered:0,read:0,reused:0,unreadable:[],notes:'No se pudo acceder'};let diff=await M.compareReview(p,incoming),next=M.applyReview(p,diff,[],'Ana');assert.equal(next.processedFiles.length,1);assert.ok(diff.warnings.some(x=>x.includes('processedFiles')));
 const update=await M.prepareReview(next);update.processedFiles[0].lastSeenAt='2026-09-22T12:00:00Z';update.analysis.coverage={folderUrl:folder,recursive:true,discovered:1,read:0,reused:1,unreadable:[],notes:'Metadatos verificados'};diff=await M.compareReview(next,update);next=M.applyReview(next,diff,diff.changes.map(x=>x.key),'Ana');assert.equal(next.processedFiles[0].processing.processedAt,'2026-09-21T10:01:00Z');assert.equal(next.analysis.coverage.reused,1);
});
test('Aceptar lectura y descartar sus resultados obliga a revisar antes de reutilizar',async()=>{
 const p=fresh(),incoming=await M.prepareReview(p);incoming.processedFiles.push(processed());incoming.checklist[0].state='missing';const diff=await M.compareReview(p,incoming),next=M.applyReview(p,diff,['processedFiles:file_1'],'Ana');assert.equal(next.processedFiles[0].processing.forceReview,true);assert.equal(F.summary(next).skip,0);
});
test('La relectura no puede retirarse sin registrar un nuevo procesamiento',()=>{
 const entry=processed();entry.processing.forceReview=true;const p=M.upsertRecord(fresh(),'processedFiles',entry,'Solicitar relectura','Ana'),same=M.clone(entry);same.processing.forceReview=false;assert.throws(()=>M.upsertRecord(p,'processedFiles',same,'Quitar','Ana'),/nueva fecha/);const next=M.upsertRecord(p,'processedFiles',F.complete(entry,'Ana','2026-09-22T10:00:00Z'),'Leído otra vez','Ana');assert.equal(F.summary(next).skip,1);
});
test('Compatibilidad: un JSON previo puede exportarse e incorporar inventario sin migración destructiva',async()=>{
 const old=fresh();delete old.processedFiles;delete old.analysis.coverage.reused;M.validateProject(old);const oldDigest=await M.digest(old);const incoming=await M.prepareReview(old);assert.equal(incoming.reviewContext.baseDigest,oldDigest);assert.deepEqual(incoming.processedFiles,[]);incoming.processedFiles.push(processed());const diff=await M.compareReview(old,incoming),next=M.applyReview(old,diff,diff.changes.map(x=>x.key),'Ana');assert.equal(next.processedFiles.length,1);assert.deepEqual(next.history[0],old.history[0]);assert.equal(old.processedFiles,undefined);
});
test('Cobertura distingue lectura actual y reutilización; el prompt pide comparación previa',()=>{
 const p=fresh();p.analysis.coverage={folderUrl:folder,recursive:true,discovered:1,read:1,reused:1,unreadable:[],notes:''};assert.throws(()=>M.validateProject(p),/reutilizados/);const text=prompt(fresh());for(const word of ['processedFiles','processing.fingerprint','forceReview','metadatos','reused'])assert.ok(text.includes(word));
});
test('Cambiar el orden de claves del JSON no simula una nueva versión procesada',()=>{
 const p=M.upsertRecord(fresh(),'processedFiles',processed(),'Registro','Ana'),entry=M.clone(p.processedFiles[0]);
 entry.processing.source=Object.fromEntries(Object.entries(entry.processing.source).reverse());entry.processing.fingerprint=Object.fromEntries(Object.entries(entry.processing.fingerprint).reverse());entry.observed.version='13';
 const next=M.upsertRecord(p,'processedFiles',entry,'Inventario actualizado','Ana');assert.equal(next.processedFiles[0].processing.fingerprint.version,'12');assert.equal(F.summary(next).read,1);
});
