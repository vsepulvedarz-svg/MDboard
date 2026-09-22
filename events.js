/* Interacciones, formularios y guardado. Sin servicios ni librerías externas. */
'use strict';
function reportError(error) {
  if (error.name === 'AbortError') return;
  if ($('#app-dialog').open) showError(error);
  else showDialog('No se pudo completar la operación', `<p class="form-notice">${esc(error.message || error)}</p>${actionButton('close-dialog','Entendido')}`);
}
function chooseJSON() { $('#json-file-input').value=''; $('#json-file-input').click(); }
function showSettings() {
  showDialog('Configuración', `<div class="settings-list"><p class="dialog-description">Cada proyecto conserva su propio calendario y un registro del autor de los cambios.</p>${actionButton('identity','Nombre del responsable')}${project()?actionButton('calendar','Calendario del proyecto seleccionado'):''}<a href="assets/Requerimientos_minimos_CCM_VDF.pdf" target="_blank" rel="noopener">Abrir guía de requisitos CCM/VDF</a><p class="field-help">Los datos se guardan en este navegador. Vincula una carpeta para mantener un JSON por proyecto o usa «Exportar JSON» como respaldo. Al volver a abrir el dashboard, puedes vincular nuevamente la misma carpeta.</p></div>`);
}
function showProjectOptions(projectId) {
  if(projectId)selectProject(projectId);
  if(!project()){showProjectForm();return;}
  showDialog('Opciones del proyecto', `<p class="dialog-description">${esc(project().info.name)}</p><div class="settings-list">${actionButton('export','Exportar JSON completo')}${closed(project())?actionButton('reopen','Reabrir proyecto'):`${actionButton('edit-project','Editar proyecto')}${actionButton('ai-workflow','Preparar revisión IA')}${actionButton('close-project','Cerrar propuesta')}`}</div>`,{context:context()});
}
async function connectFolder({showReport=true}={}) {
  if(!window.showDirectoryPicker) {
    showDialog('Carpeta de proyectos', '<p class="dialog-description">Este navegador no permite guardar directamente en una carpeta. Puedes importar y exportar los JSON con los botones del dashboard. Para vincular una carpeta, abre esta base en Chrome o Edge, desde localhost o un contexto seguro compatible.</p>'+actionButton('close-dialog','Entendido'));return;
  }
  const handle=await window.showDirectoryPicker({mode:'readwrite'});
  const report=await store.connect(handle,{followExternal:true});loadProjects();renderAll();
  try { await CCMStorage.rememberedFolder(handle); } catch { toast('Carpeta vinculada. Este navegador no permite recordar el permiso entre sesiones.'); }
  state.fileMessage=[...report.errors,report.conflicts.length?'Hay archivos con versiones diferentes. Impórtalos para revisar sus cambios; no se sobrescribieron.':''].filter(Boolean).join(' ');renderStorage();
  if(showReport)showDialog('Carpeta vinculada', `<p class="dialog-description">${esc(handle.name)} · ${report.added.length} incorporados · ${report.linked.length} vinculados · ${report.updated.length} actualizados.</p><p>Cada proyecto nuevo se guardará en su JSON. Las actualizaciones válidas del agente aparecerán automáticamente; la carpeta se comprueba cada 5 segundos y al volver a esta ventana.</p><p>Usa «Guardar todos» para copiar los proyectos que solo estén en el navegador.</p>${report.conflicts.length?`<div class="form-notice"><strong>Revisar antes de sincronizar</strong><ul>${report.conflicts.map(entry=>`<li>${esc(entry.filename)} · versión ${entry.version}</li>`).join('')}</ul><p>Importa cada archivo mediante «Importar JSON» para resolver la diferencia.</p></div>`:''}${report.errors.length?`<div class="form-notice">${report.errors.map(esc).join('<br>')}</div>`:''}<div class="dialog-actions">${actionButton('close-dialog','Listo')}</div>`);
}
async function newProjectFlow() {
  if(!store?.connected && window.showDirectoryPicker) await connectFolder({showReport:false});
  showProjectForm();
}
async function refreshProjectFiles() {
  if(!store?.connected || savingProject || document.hidden)return;
  try {
    const report=await store.refresh();
    const message=[...report.errors,...report.conflicts.map(entry=>`Versiones incompatibles: ${entry.filename}. Se conserva la copia del navegador.`)].join(' ');
    if(state.fileMessage!==message){state.fileMessage=message;renderStorage();}
    if(report.added.length || report.updated.length){loadProjects();renderAll();toast('Proyectos actualizados desde sus archivos JSON.');}
  } catch(error) {state.fileMessage=error.message;renderStorage();}
}
async function restoreProjectFolder() {
  try {
    const handle=await CCMStorage.rememberedFolder();
    if(!handle || store?.connected)return;
    if(await handle.queryPermission({mode:'readwrite'})!=='granted'){
      state.fileMessage='Vuelve a vincular la carpeta de proyectos para reactivar el guardado y la recarga automáticos.';renderStorage();return;
    }
    if(store?.connected)return;
    await store.connect(handle,{followExternal:true});loadProjects();renderAll();await refreshProjectFiles();
  } catch { /* La elección manual de carpeta sigue disponible. */ }
}
document.addEventListener('submit', async event => {
  const form=event.target;
  if(!form.id.startsWith('form-'))return;
  event.preventDefault();
  const button=$('[type="submit"]',form);if(button?.disabled)return;
  if(button)button.disabled=true;
  $('#dialog-error').hidden=true;
  try {
    for(const input of $$('input[required],textarea[required]',form))if(input.type!=='checkbox'&&!input.value.trim())throw new Error('Completa los campos obligatorios sin dejar solo espacios.');
    const data=new FormData(form),get=name=>String(data.get(name)||'').trim();
    const values=names=>Object.fromEntries(names.map(name=>[name,get(name)]));
    if(form.id==='form-identity') {
      localStorage.setItem('ccm-vdf.actor',get('actor'));state.actor=get('actor');renderStorage();$('#app-dialog').close();toast('Responsable actualizado.');return;
    }
    let previous=form.id==='form-project'&&state.formContext.form==='new-project'?null:formProject(),next,after;
    const reason=get('reason'),actor=state.actor;
    switch(form.id) {
      case 'form-project': {
        const info=values(['client','buyer','name','crm','manager','location','startDate','targetDate','driveUrl','technology']);
        next=previous?CCM.updateInfo(previous,{...info,...values(['offerStatus','offerReason'])},reason,actor):CCM.createProject(info,actor);
        if(!previous){state.lifecycle='active';state.status='';state.search='';$('#global-search').value='';}
        break;
      }
      case 'form-checklist':next=CCM.updateChecklist(previous,state.formContext.itemId,{...values(['state','value','notes']),evidence:readEvidence(form),manualLock:data.has('manualLock')},reason,actor);break;
      case 'form-document':next=CCM.upsertRecord(previous,'documents',{...state.formContext.original,...values(['name','path','familyId','revision','url','mimeType','readStatus','notes'])},reason,actor);break;
      case 'form-file': {
        let entry={...CCM.clone(state.formContext.original),...values(['fileName','folderUrl','path','driveFileId','url','documentId','availability']),lastSeenAt:CCM.now(),observed:{...values(['modifiedTime','version','checksumAlgorithm','checksum']),sizeBytes:get('sizeBytes')===''?null:Number(get('sizeBytes'))}};
        entry.processing={...entry.processing,status:get('processingStatus'),notes:get('processingNotes')};
        if(data.has('confirmProcessed')){
          if(entry.processing.status!=='processed')throw new Error('Selecciona lectura «Completa» para confirmar que revisaste todo el contenido.');
          entry=CCMFiles.complete(entry,actor);
        }
        next=CCM.upsertRecord(previous,'processedFiles',entry,reason,actor);break;
      }
      case 'form-file-reread': {
        const entry=CCM.clone(previous.processedFiles.find(file=>file.id===state.formContext.recordId));entry.processing.forceReview=true;
        next=CCM.upsertRecord(previous,'processedFiles',entry,reason,actor);break;
      }
      case 'form-revision':next=CCM.upsertRecord(previous,'revisions',{...state.formContext.original,...values(['familyId','fromRevision','toRevision','fromDocumentId','toDocumentId','summary','justification','justificationStatus','impact']),evidence:readEvidence(form)},reason,actor);break;
      case 'form-team':next=CCM.upsertRecord(previous,'team',{...state.formContext.original,...values(['name','role','company','phone','email','notes'])},reason,actor);break;
      case 'form-query': {
        const record={id:CCM.id('qry'),...values(['title','question','assignedTo']),status:'open',resolution:'',closedAt:null,createdAt:CCM.now(),createdBy:actor,relatedChecklistIds:get('relatedChecklistId')?[get('relatedChecklistId')]:[],evidence:readEvidence(form),messages:[]};
        next=CCM.upsertRecord(previous,'queries',record,'Creación de consulta: '+record.title,actor);state.queryFilter='open';break;
      }
      case 'form-query-message': {
        const queryId=state.formContext.queryId;
        next=CCM.queryMessage(previous,queryId,get('body'),readEvidence(form),actor,get('transition'));after=()=>showQueryDetail(queryId);break;
      }
      case 'form-note':next=CCM.addNote(previous,get('body'),readEvidence(form),actor);break;
      case 'form-holiday': {
        const calendar=CCM.clone(previous.calendar);calendar.holidays.push({id:CCM.id('holiday'),...values(['date','name','scope','source'])});
        next=CCM.updateCalendar(previous,calendar,reason,actor);after=()=>showCalendar(Number(get('date').slice(0,4)));break;
      }
      case 'form-remove-holiday': {
        const calendar=CCM.clone(previous.calendar),holiday=calendar.holidays.find(entry=>entry.id===state.formContext.holidayId);
        calendar.holidays=calendar.holidays.filter(entry=>entry.id!==holiday.id);next=CCM.updateCalendar(previous,calendar,reason,actor);after=()=>showCalendar(Number(holiday.date.slice(0,4)));break;
      }
      case 'form-calendar-coverage': {
        if(!data.has('verified'))throw new Error('Confirma la revisión de los feriados de este año.');
        const calendar=CCM.clone(previous.calendar),year=Number(get('year'));
        calendar.coverage=calendar.coverage.filter(entry=>entry.year!==year);calendar.coverage.push({year,complete:true,source:get('source'),verifiedAt:CCM.today(),scope:'project'});
        next=CCM.updateCalendar(previous,calendar,reason,actor);after=()=>showCalendar(year);break;
      }
      case 'form-close-project':next=CCM.closeProject(previous,{date:get('date'),outcome:get('outcome'),reason,actor});state.lifecycle='closed';state.status='';after=()=>CCMStorage.download(next);break;
      case 'form-reopen-project':next=CCM.reopenProject(previous,reason,actor);state.lifecycle='active';state.status='';break;
      case 'form-apply-review':next=CCM.applyReview(previous,state.review,data.getAll('change'),actor);break;
      default:throw new Error('Formulario desconocido.');
    }
    const mirrored=await persist(next,previous?.version??null,form.id==='form-apply-review'?state.pendingImport:null);
    if(form.id==='form-apply-review'){state.pendingImport=null;state.review=null;}
    $('#app-dialog').close();if(after)after();
    toast(mirrored?'Cambios guardados.':'Guardado en el navegador. Revisa el aviso de la carpeta.');
  } catch(error) {showError(error);} finally {if(button)button.disabled=false;}
});
document.addEventListener('click',async event=>{
  const target=event.target.closest('button,a,tr[data-project]');if(!target)return;
  try {
    if(target.dataset.action) {
      const action=target.dataset.action,recordId=target.dataset.id||'';
      switch(action) {
        case 'new-project':await newProjectFlow();break;
        case 'edit-project':showProjectForm(true);break;
        case 'project-options':showProjectOptions(recordId);break;
        case 'import':chooseJSON();break;
        case 'close-dialog':$('#app-dialog').close();break;
        case 'checklist':showChecklist(recordId);break;
        case 'evidence':{const item=project().checklist.find(entry=>entry.id===recordId);showDialog('Origen · '+item.label,evidenceMarkup(item.evidence),{wide:true});break;}
        case 'document-form':showDocumentForm(recordId);break;
        case 'file-form':showFileForm(recordId);break;
        case 'file-details':showFileDetails(recordId);break;
        case 'file-reread':showFileReread(recordId);break;
        case 'revision-form':showRevisionForm(recordId);break;
        case 'team-form':showTeamForm(recordId);break;
        case 'query-form':showQueryForm(recordId);break;
        case 'query-detail':showQueryDetail(recordId);break;
        case 'note-form':showNoteForm();break;
        case 'identity':showIdentity();break;
        case 'calendar':showCalendar();break;
        case 'holiday-form':showHolidayForm();break;
        case 'remove-holiday':showRemoveHoliday(recordId);break;
        case 'close-project':showCloseProject();break;
        case 'reopen':case 'reopen-project':showReopenProject();break;
        case 'ai-workflow':showAIWorkflow();break;
        case 'manual-ai-workflow':showManualAIWorkflow();break;
        case 'copy-pipeline':{
          const area=$('#pipeline-prompt');
          try{await navigator.clipboard.writeText(area.value);toast('Mensaje copiado.');}
          catch{area.focus();area.select();toast('Selecciona y copia el mensaje con Ctrl+C.');}break;
        }
        case 'export':CCMStorage.download(project());toast('JSON preparado para descargar.');break;
        case 'export-review':{const value=await CCM.prepareReview(formProject());CCMStorage.download(value,`${value.id}.revision-ia.json`);toast('Adjunta este JSON al chat junto con las instrucciones.');break;}
        case 'copy-prompt':{const input=$('#ai-prompt');try{await navigator.clipboard.writeText(input.value);toast('Instrucciones copiadas.');}catch{input.closest('details').open=true;input.focus();input.select();toast('Seleccionado: presiona Ctrl+C para copiar.');}break;}
        case 'confirm-import':{
          const pending=state.pendingImport;if(!pending)throw new Error('Selecciona nuevamente el archivo.');
          const saved=await persist(pending.incoming,state.formContext.version,pending);state.lifecycle=closed(pending.incoming)?'closed':'active';state.status='';state.search='';$('#global-search').value='';renderAll();state.pendingImport=null;$('#app-dialog').close();toast(saved?'Proyecto importado.':'Importado al navegador. Revisa el aviso de la carpeta.');break;
        }
        case 'add-evidence':target.closest('fieldset').querySelector('.evidence-editors').insertAdjacentHTML('beforeend',evidenceRow());break;
        case 'remove-evidence':target.closest('.evidence-edit').remove();break;
        case 'reset-checklist':state.pillar='';state.section='';state.checkState='';state.checkSearch='';state.page=1;renderPanel();break;
        case 'previous-page':state.page=Math.max(1,state.page-1);renderPanel();break;
        case 'next-page':state.page++;renderPanel();break;
      }
      return;
    }
    if(target.dataset.selectProject){selectProject(target.dataset.selectProject);return;}
    if(target.dataset.openQuery){selectProject(target.dataset.owner);state.tab='queries';renderPanel();closePopovers();showQueryDetail(target.dataset.openQuery);return;}
    if(target.hasAttribute('data-status')){state.status=target.dataset.status;state.lifecycle='active';renderKPIs();renderProjects();return;}
    if(target.dataset.pillar){state.pillar=state.pillar===target.dataset.pillar?'':target.dataset.pillar;state.page=1;renderPanel();return;}
    if(target.dataset.queryFilter){state.queryFilter=target.dataset.queryFilter;renderPanel();return;}
    if(target.dataset.tab){state.tab=target.dataset.tab;renderPanel();return;}
    if(target.dataset.nav){
      $$('.nav-item').forEach(button=>{const active=button===target;button.classList.toggle('active',active);if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
      document.body.classList.remove('menu-open');
      const nav=target.dataset.nav;
      if(nav==='settings'){showSettings();return;}
      if(nav==='dashboard'){state.status='';state.search='';state.lifecycle='active';$('#global-search').value='';renderAll();window.scrollTo({top:0,behavior:'smooth'});}
      else if(nav==='portfolio')$('#portfolio').scrollIntoView({behavior:'smooth',block:'start'});
      else if(project()){state.tab=nav==='queries'?'queries':nav==='suppliers'?'team':'summary';renderPanel();$('#project-detail').scrollIntoView({behavior:'smooth',block:'start'});if(nav==='suppliers')toast('Contactos del proyecto, agrupados con su empresa.');}
      else toast('Crea o importa un proyecto para comenzar.');return;
    }
    switch(target.id){
      case 'new-project':await newProjectFlow();break;
      case 'connect-folder':await connectFolder();break;
      case 'import-project':chooseJSON();break;
      case 'save-all':{const results=await Promise.allSettled(state.projects.map(value=>store.mirror(value)));renderStorage();toast(`${results.filter(result=>result.status==='fulfilled').length} proyectos guardados en la carpeta.${results.some(result=>result.status==='rejected')?' Revisa los avisos.':''}`);break;}
      case 'portfolio-options':showDialog('Opciones de cartera',`<div class="settings-list">${actionButton('new-project','Crear proyecto vacío')}${actionButton('import','Importar JSON')}${actionButton('identity','Cambiar responsable')}<p class="field-help">Los proyectos cerrados se consultan en el filtro de la cartera. Cada archivo JSON conserva el historial completo de un proyecto.</p></div>`);break;
      case 'close-dialog':$('#app-dialog').close();break;
      case 'notifications-button':case 'profile-button':{const name=target.id.replace('-button',''),open=$(`#${name}-popover`).hidden;closePopovers();$(`#${name}-popover`).hidden=!open;target.setAttribute('aria-expanded',String(open));break;}
      case 'all-actions':{const queries=state.projects.filter(value=>!closed(value)).flatMap(value=>value.queries.filter(query=>query.status==='open').map(query=>({value,query})));showDialog('Todas las consultas abiertas',queries.map(({value,query})=>`<button class="notification-entry" data-open-query="${esc(query.id)}" data-owner="${esc(value.id)}">${esc(query.title)}<small>${esc(value.info.client)} · ${esc(value.info.name)}</small></button>`).join('')||empty('Sin consultas abiertas.'));break;}
      case 'all-activity':if(project()){state.tab='history';renderPanel();$('#project-panel').scrollIntoView({behavior:'smooth'});}break;
      default:if(target.dataset.project)selectProject(target.dataset.project);
    }
    if(target.classList.contains('mobile-menu')){const open=document.body.classList.toggle('menu-open');target.setAttribute('aria-expanded',String(open));}
  }catch(error){reportError(error);}
});
document.addEventListener('click',event=>{if(!event.target.closest('.popover-anchor'))closePopovers();if(event.target.classList.contains('sidebar-backdrop'))document.body.classList.remove('menu-open');});
document.addEventListener('change',async event=>{
  const input=event.target;
  try {
    if(input.id==='json-file-input') {const file=input.files[0];if(file){if(file.size>15*1024*1024)throw new Error('El JSON supera el máximo de 15 MB.');await receiveJSON(await file.text(),file.name);}return;}
    if(input.id==='lifecycle-filter'){state.lifecycle=input.value;state.status='';renderKPIs();renderProjects();}
    if(input.id==='section-filter'){state.section=input.value;state.page=1;renderPanel();}
    if(input.id==='check-state-filter'){state.checkState=input.value;state.page=1;renderPanel();}
    if(input.id==='calendar-year')showCalendar(Number(input.value));
    if(input.dataset.ev==='documentId'){const doc=project().documents.find(entry=>entry.id===input.value);if(doc){const row=input.closest('.evidence-edit');for(const [key,value]of Object.entries({fileName:doc.name,path:doc.path,revision:doc.revision,url:doc.url}))$(`[data-ev="${key}"]`,row).value=value;}}
    if(['fromDocumentId','toDocumentId'].includes(input.name)){const doc=project().documents.find(entry=>entry.id===input.value);if(doc){input.form.elements[input.name==='fromDocumentId'?'fromRevision':'toRevision'].value=doc.revision;input.form.elements.familyId.value=doc.familyId;}}
  }catch(error){reportError(error);}
});
document.addEventListener('input',event=>{
  const input=event.target;
  if(input.id==='global-search'){state.search=input.value;renderProjects();}
  if(input.id==='checklist-search'){state.checkSearch=input.value;state.page=1;renderPanel();const fresh=$('#checklist-search');fresh.focus();}
  if(input.form?.id==='form-close-project'&&input.name==='date'){try{const count=CCM.businessDaysBetween(formProject().info.startDate,input.value,formProject().calendar);$('#close-counter').textContent=`${count.days} días hábiles${count.complete?'':' · calendario incompleto'}`;}catch{$('#close-counter').textContent='Revisa la fecha de cierre.';}}
});
document.addEventListener('keydown',event=>{
  if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();$('#global-search').focus();}
  if(event.key==='Escape'){closePopovers();document.body.classList.remove('menu-open');}
  if(event.target.matches('.tab')&&['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){
    event.preventDefault();const tabs=$$('.tab'),index=tabs.indexOf(event.target),next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;state.tab=tabs[next].dataset.tab;renderPanel();tabs[next].focus();
  }
});
window.addEventListener('storage',event=>{if(event.key?.startsWith(CCMStorage.PREFIX)){loadProjects();renderAll();toast('La cartera se actualizó desde otra pestaña.');}});
window.addEventListener('resize',()=>{if(window.innerWidth>900)document.body.classList.remove('menu-open');});
let shownDay=CCM.today();setInterval(()=>{if(CCM.today()!==shownDay){shownDay=CCM.today();renderAll();}},60000);
async function loadDemoFromQuery() {
  if (!store || new URLSearchParams(window.location.search).get('demo') !== '1') return;
  const response = await fetch('projects/prj_demo_50.json', { cache: 'no-store' });
  if (!response.ok) throw new Error(`No se pudo cargar el proyecto demo (${response.status}).`);
  const demo = CCM.parseJSON(await response.text());
  CCM.validateProject(demo);
  if (!store.get(demo.id)) store.save(demo);
  state.selectedId = demo.id;
}
async function bootstrap() {
  try { await loadDemoFromQuery(); }
  catch (error) { startupError = `No se pudo cargar la demostración: ${error.message}`; }
  loadProjects();renderAll();
  restoreProjectFolder();
}
bootstrap();
setInterval(refreshProjectFiles,5000);
window.addEventListener('focus',refreshProjectFiles);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshProjectFiles();});
