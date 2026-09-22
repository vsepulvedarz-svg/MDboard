/* Un registro por proyecto en el navegador y, opcionalmente, un archivo JSON
 * por proyecto en una carpeta elegida con File System Access API.
 * Nunca se sobrescribe silenciosamente un archivo modificado externamente.
 */
var CCMStorage = (() => {
  'use strict';
  const model = typeof CCM !== 'undefined' ? CCM : require('./model.js');
  const PREFIX = 'ccm-vdf.project.v1.';
  function isSuccessor(previous, next) {
    return previous.id === next.id && previous.createdAt === next.createdAt && next.version > previous.version &&
      next.history.length > previous.history.length && previous.history.every((event,index) => model.same(event,next.history[index])) &&
      next.reviews.length >= previous.reviews.length && previous.reviews.every((review,index) => model.same(review,next.reviews[index]));
  }
  function create(storage) {
    let directory = null, followExternal = false, refreshTask = null;
    const bindings = new Map(), queues = new Map(), fileErrors = new Map(), conflicts = new Map();
    const get = projectId => {
      const source = storage.getItem(PREFIX + projectId);
      if (!source) return null;
      const project = model.parseJSON(source);
      model.validateProject(project);
      return project;
    };
    const list = () => {
      const projects = [], errors = [];
      for (let index = 0; index < storage.length; index++) {
        const key = storage.key(index);
        if (!key?.startsWith(PREFIX)) continue;
        try { projects.push(get(key.slice(PREFIX.length))); }
        catch (error) { errors.push(`${key.slice(PREFIX.length)}: ${error.message}`); }
      }
      return { projects: projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), errors };
    };
    const save = (project, expectedVersion = null) => {
      model.validateProject(project);
      if (project.reviewContext) throw new Error('Una revisión de IA debe compararse y aplicarse sobre el JSON padre.');
      if (project.info.offerStatus === 'firm' && model.blockers(project).length) throw new Error('No se puede guardar una oferta firme con controles críticos pendientes.');
      const previous = get(project.id);
      if (previous && previous.version !== expectedVersion) throw new Error('Otra pestaña o una importación actualizó este proyecto. Recarga la vista antes de guardar.');
      if (!previous && expectedVersion !== null) throw new Error('No se encuentra la versión anterior del proyecto.');
      if (previous && project.version <= previous.version) throw new Error('La versión nueva debe ser posterior a la guardada.');
      try { storage.setItem(PREFIX + project.id, JSON.stringify(project)); }
      catch { throw new Error('No se pudo guardar en el navegador: revisa el espacio disponible. El cambio no se aplicó. Exporta un respaldo de tus proyectos.'); }
      return model.clone(project);
    };
    async function write(project) {
      if (!directory) return { saved: false, reason: 'no_directory' };
      await assertWritable(project.id);
      if (conflicts.has(project.id)) throw new Error(`Importa y revisa primero el archivo en conflicto: ${conflicts.get(project.id)}.`);
      let binding = bindings.get(project.id);
      if (!binding) {
        const filename = `${project.id}.json`;
        let existing;
        try { existing = await directory.getFileHandle(filename); }
        catch (error) { if (error.name !== 'NotFoundError') throw error; }
        if (existing) {
          const content = await (await existing.getFile()).text();
          let parsed;
          try { parsed = model.parseJSON(content); model.validateProject(parsed); } catch { throw new Error(`${filename} ya existe y no es un respaldo válido. No se sobrescribió.`); }
          if (!model.same(parsed, project)) throw new Error(`${filename} ya existe con otro contenido. Impórtalo y revisa los cambios antes de guardar.`);
          binding = { handle: existing, content };
          bindings.set(project.id, binding);
          fileErrors.delete(project.id);
          return { saved: true, filename };
        }
        const handle = await directory.getFileHandle(filename, { create: true });
        binding = { handle, content: '' };
        bindings.set(project.id, binding);
      }
      const actual = await (await binding.handle.getFile()).text();
      if (actual !== binding.content) throw new Error(`${binding.handle.name} cambió fuera del dashboard. Tus cambios siguen guardados en el navegador; importa el archivo externo antes de sincronizar.`);
      const content = JSON.stringify(project, null, 2) + '\n';
      const writable = await binding.handle.createWritable();
      try { await writable.write(content); await writable.close(); }
      catch (error) { try { await writable.abort(); } catch { /* Ya cerrado. */ } throw error; }
      binding.content = content;
      fileErrors.delete(project.id);
      return { saved: true, filename: binding.handle.name };
    }
    function mirror(project) {
      // Capturar esta versión antes de encolar: un cambio posterior no altera la escritura pendiente.
      const snapshot = model.clone(project);
      const previous = queues.get(project.id) || Promise.resolve();
      const task = previous.catch(() => {}).then(() => write(snapshot)).catch(error => {
        fileErrors.set(project.id, error.message);
        throw error;
      });
      queues.set(project.id, task);
      return task;
    }
    async function connect(handle, options = {}) {
      await Promise.allSettled([...queues.values()]);
      directory = handle;
      followExternal = Boolean(options.followExternal);
      bindings.clear(); fileErrors.clear(); conflicts.clear();
      if (followExternal) return refresh();
      const report = { added: [], linked: [], updated: [], conflicts: [], errors: [] };
      for await (const [filename, fileHandle] of handle.entries()) {
        if (fileHandle.kind !== 'file' || !filename.toLowerCase().endsWith('.json')) continue;
        try {
          const file = await fileHandle.getFile();
          if (file.size > 15 * 1024 * 1024) throw new Error('Archivo mayor de 15 MB.');
          const content = await file.text(), project = model.parseJSON(content);
          if (project.kind !== model.KIND) continue;
          model.validateProject(project);
          const current = get(project.id);
          if (bindings.has(project.id) || (current && !model.same(current, project)) || project.reviewContext) { report.conflicts.push({ filename, id: project.id, version: project.version }); conflicts.set(project.id,filename); continue; }
          if (!current) { save(project); report.added.push(project.id); }
          else report.linked.push(project.id);
          bindings.set(project.id, { handle: fileHandle, content });
        } catch (error) { report.errors.push(`${filename}: ${error.message}`); }
      }
      return report;
    }
    async function assertWritable(projectId) {
      if (!directory) return;
      let handle;
      try { handle = await directory.getFileHandle(`${projectId}.lock`); }
      catch (error) { if (error.name === 'NotFoundError') return; throw error; }
      if (handle) throw new Error('El agente está actualizando este proyecto. Espera a que termine para guardar cambios manuales.');
    }
    async function refreshNow() {
      const report = { added: [], linked: [], updated: [], conflicts: [], errors: [] };
      if (!directory || !followExternal) return report;
      await Promise.allSettled([...queues.values()]);
      const candidates = new Map(), filenames = new Set();
      for await (const [filename,handle] of directory.entries()) {
        if (handle.kind !== 'file' || !filename.toLowerCase().endsWith('.json')) continue;
        filenames.add(filename);
        try {
          const file = await handle.getFile();
          if (file.size > 15*1024*1024) throw new Error('Archivo mayor de 15 MB.');
          const content = await file.text(), incoming = model.parseJSON(content);
          if (incoming.kind !== model.KIND) continue;
          model.validateProject(incoming);
          if (incoming.reviewContext) throw new Error('Respuesta de revisión pendiente: el agente debe validarla y aplicarla antes de guardarla como JSON padre.');
          const group = candidates.get(incoming.id) || [];
          group.push({incoming,handle,content,filename});candidates.set(incoming.id,group);
        } catch (error) { report.errors.push(`${filename}: ${error.message}`); }
      }
      for (const [id,group] of candidates) {
        if (group.length > 1) {
          const filename = group.map(entry => entry.filename).join(', ');
          conflicts.set(id,filename);report.conflicts.push({filename,id,version:group[0].incoming.version});continue;
        }
        const {incoming,handle,content,filename} = group[0];
        try {
          const current = get(incoming.id);
          if (current && !model.same(current,incoming) && !isSuccessor(current,incoming)) {
            conflicts.set(incoming.id,filename);report.conflicts.push({filename,id,version:incoming.version});continue;
          }
          if (!current) { save(incoming);report.added.push(incoming.id); }
          else if (!model.same(current,incoming)) { save(incoming,current.version);report.updated.push(incoming.id); }
          else report.linked.push(incoming.id);
          // Solo se enlaza el contenido que se acaba de validar. Un conflicto no se sobrescribe.
          bindings.set(incoming.id,{handle,content});conflicts.delete(incoming.id);fileErrors.delete(incoming.id);
        } catch (error) { report.errors.push(`${filename}: ${error.message}`); }
      }
      for (const [id,binding] of bindings) if (!filenames.has(binding.handle.name)) report.errors.push(`${binding.handle.name} ya no está en la carpeta. Se conserva la copia del navegador.`);
      return report;
    }
    function refresh() {
      if (!refreshTask) refreshTask = refreshNow().finally(() => { refreshTask = null; });
      return refreshTask;
    }
    async function beforeChange(projectId) {
      await refresh();
      await assertWritable(projectId);
      if (conflicts.has(projectId)) throw new Error(`Hay versiones incompatibles de ${conflicts.get(projectId)}. Resuelve la diferencia antes de editar.`);
      const binding = bindings.get(projectId);
      if (binding && await (await binding.handle.getFile()).text() !== binding.content) throw new Error('El archivo cambió fuera del dashboard. Espera a la recarga o revisa el error de formato antes de editar.');
    }
    async function acknowledgeExternal(projectId, fileName, expectedSource) {
      if (!directory) return;
      const binding = bindings.get(projectId);
      // Un JSON de revisión descargado aparte no reemplaza el vínculo al archivo padre.
      if (binding && !conflicts.has(projectId)) {
        const actual = await (await binding.handle.getFile()).text();
        if (actual === binding.content) return;
      }
      let handle = binding?.handle;
      if (conflicts.has(projectId) && fileName) { try { handle = await directory.getFileHandle(fileName); } catch { throw new Error('Importa el archivo en conflicto desde la carpeta vinculada.'); } }
      if (!handle && model.parseJSON(expectedSource).reviewContext && !conflicts.has(projectId)) return;
      if (!handle && fileName) { try { handle = await directory.getFileHandle(fileName); } catch { return; } }
      if (!handle) return;
      const content = await (await handle.getFile()).text();
      if (content !== expectedSource) throw new Error('El archivo volvió a cambiar durante la importación. No se ha sobrescrito.');
      const parsed = model.parseJSON(content);
      if (parsed.id !== projectId) throw new Error('El archivo no pertenece al proyecto.');
      bindings.set(projectId, { handle, content });
      conflicts.delete(projectId);
    }
    return { get, list, save, mirror, connect, refresh, beforeChange, assertWritable, acknowledgeExternal, get directoryName() { return directory?.name || ''; }, get connected() { return Boolean(directory); }, get followsExternal() { return followExternal; }, get errors() { return [...fileErrors.values()]; }, prefix: PREFIX };
  }
  async function rememberedFolder(handle) {
    if (typeof indexedDB === 'undefined') return null;
    return new Promise((resolve,reject) => {
      const request = indexedDB.open('ccm-vdf-folder',1);
      request.onupgradeneeded = () => request.result.createObjectStore('settings');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db=request.result,tx=db.transaction('settings',handle?'readwrite':'readonly'),settings=tx.objectStore('settings');
        const operation=handle?settings.put(handle,'directory'):settings.get('directory');let result=null;
        operation.onsuccess=()=>{result=operation.result;};
        tx.oncomplete=()=>{db.close();resolve(handle||result||null);};
        tx.onerror=()=>{db.close();reject(tx.error);};
      };
    });
  }
  function download(project, filename = `${project.id}.json`) {
    const blob = new Blob([JSON.stringify(project, null, 2) + '\n'], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob), anchor = document.createElement('a');
    anchor.href = url; anchor.download = filename;
    document.body.append(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return { create, download, isSuccessor, rememberedFolder, PREFIX };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = CCMStorage;
