/* Registro incremental de Drive. Compara metadatos aportados por el chat;
 * no accede a Drive ni afirma haber leído archivos. Sin dependencias. */
var CCMFiles = (() => {
  'use strict';
  const clone = value => JSON.parse(JSON.stringify(value));
  const metadata = () => ({ modifiedTime: '', sizeBytes: null, version: '', checksumAlgorithm: '', checksum: '' });
  const blank = (id, folderUrl = '') => ({ id, documentId: '', driveFileId: '', folderUrl, fileName: '', path: '', url: '', lastSeenAt: null, availability: 'present', observed: metadata(), processing: { status: 'pending', processedAt: null, provider: '', source: null, fingerprint: null, forceReview: false, notes: '' } });
  const source = file => ({ folderUrl: file.folderUrl, driveFileId: file.driveFileId, path: file.path, url: file.url });
  function complete(file, provider, at = new Date().toISOString()) {
    return { ...clone(file), processing: { ...clone(file.processing), status: 'processed', processedAt: at, provider, source: source(file), fingerprint: clone(file.observed), forceReview: false } };
  }
  const urlKey = value => { try { const url = new URL(value); url.hash = ''; return url.href.replace(/\/$/, ''); } catch { return ''; } };
  function evaluate(file, folderUrl) {
    const result = (action, label, reason) => ({ action, label, reason });
    const p = file.processing;
    if (file.availability !== 'present') return result('unavailable', file.availability === 'removed' ? 'Retirado de la carpeta' : 'No localizado', 'Conservar el registro y sus evidencias. Verificar acceso o traslado; no asumir borrado por un listado incompleto.');
    if (!folderUrl || !file.folderUrl || urlKey(file.folderUrl) !== urlKey(folderUrl)) return result('verify', 'Verificar carpeta', 'La carpeta del registro no coincide con la carpeta actual del proyecto.');
    if (p.forceReview) return result('read', 'Relectura solicitada', 'Este archivo necesita una nueva revisión antes de reutilizar sus resultados.');
    if (p.status !== 'processed') return result('read', { pending: 'Pendiente de lectura', partial: 'Lectura incompleta', failed: 'Reintentar lectura' }[p.status], 'Solo una lectura completa permite omitir el contenido en revisiones posteriores.');
    const previous = p.source, before = p.fingerprint, after = file.observed;
    if (!previous || !before || urlKey(previous.folderUrl) !== urlKey(file.folderUrl)) return result('verify', 'Verificar origen', 'No existe una base de comparación de esta carpeta.');
    if (previous.driveFileId || file.driveFileId) {
      if (!previous.driveFileId || !file.driveFileId) return result('verify', 'Identidad sin verificar', 'Falta el identificador de Drive de una de las observaciones.');
      if (previous.driveFileId !== file.driveFileId) return result('read', 'Archivo diferente', 'El ID de Drive cambió, aunque coincida el nombre o la ruta.');
    } else if (!file.url || urlKey(previous.url) !== urlKey(file.url) || previous.path !== file.path) {
      return result('verify', 'Identidad sin verificar', 'Sin ID de Drive se necesitan el mismo enlace y la misma ruta para comparar.');
    }
    for (const key of ['modifiedTime', 'sizeBytes', 'version']) {
      const a = before[key], b = after[key], has = value => value !== null && value !== '';
      if (has(a) && !has(b)) return result('verify', 'Metadatos insuficientes', 'No se pudo volver a obtener un metadato utilizado en la lectura anterior.');
      if (has(a) && has(b) && (key === 'modifiedTime' ? Date.parse(a) !== Date.parse(b) : a !== b)) return result('read', 'Archivo modificado', `Cambió ${key} respecto de la versión procesada.`);
    }
    if (before.checksum && (!after.checksum || before.checksumAlgorithm !== after.checksumAlgorithm)) return result('verify', 'Huella sin comparar', 'Falta la huella o cambió su algoritmo.');
    if (before.checksum && after.checksum && before.checksum.toLowerCase() !== after.checksum.toLowerCase()) return result('read', 'Contenido modificado', 'La huella del contenido es diferente.');
    const hashMatch = before.checksum && after.checksum && before.checksumAlgorithm === after.checksumAlgorithm;
    const versionMatch = file.driveFileId && before.version && after.version && before.version === after.version;
    const dateSizeMatch = before.modifiedTime && after.modifiedTime && before.sizeBytes !== null && after.sizeBytes !== null;
    if (!hashMatch && !versionMatch && !dateSizeMatch) return result('verify', 'Metadatos insuficientes', 'El nombre, el tamaño o la fecha por separado no acreditan que siga igual.');
    return result('skip', 'Sin cambios registrados', 'Se puede reutilizar lo procesado si el próximo listado confirma estos mismos metadatos.');
  }
  function validate(file, helpers) {
    const { text, requireCondition: check, isRecord, validInstant, safeURL } = helpers;
    ['documentId','driveFileId','folderUrl','fileName','path','url'].forEach(key => text(file[key], `Archivo procesado: ${key}`, ['folderUrl','fileName','path'].includes(key)));
    check(safeURL(file.folderUrl) && (!file.url || safeURL(file.url)), 'El registro de archivo requiere enlaces http/https válidos.');
    check(file.lastSeenAt === null || validInstant(file.lastSeenAt), 'Fecha de inventario inválida.');
    check(['present','not_seen','removed'].includes(file.availability), 'Disponibilidad del archivo inválida.');
    function validateMetadata(value) {
      check(isRecord(value), 'Faltan los metadatos del archivo.');
      ['modifiedTime','version','checksumAlgorithm','checksum'].forEach(key => text(value[key], `Metadato: ${key}`));
      check(!value.modifiedTime || validInstant(value.modifiedTime), 'Fecha de modificación inválida: usa ISO 8601.');
      check(value.sizeBytes === null || (Number.isSafeInteger(value.sizeBytes) && value.sizeBytes >= 0), 'Tamaño de archivo inválido.');
      check((!value.checksum && !value.checksumAlgorithm) || ({md5:32,sha1:40,sha256:64}[value.checksumAlgorithm] === value.checksum.length && /^[a-fA-F0-9]+$/.test(value.checksum)), 'Huella inválida: indica md5, sha1 o sha256 y su valor hexadecimal real.');
    }
    validateMetadata(file.observed);
    const p = file.processing;
    check(isRecord(p) && ['pending','processed','partial','failed'].includes(p.status), 'Estado de procesamiento inválido.');
    check(typeof p.forceReview === 'boolean', 'forceReview debe ser true o false.');
    text(p.provider, 'Responsable de la lectura', p.status === 'processed');text(p.notes, 'Notas de procesamiento');
    check(p.processedAt === null || validInstant(p.processedAt), 'Fecha de procesamiento inválida.');
    if (p.source !== null) {
      check(isRecord(p.source), 'Origen procesado inválido.');
      ['folderUrl','driveFileId','path','url'].forEach(key => text(p.source[key], `Origen procesado: ${key}`, ['folderUrl','path'].includes(key)));
      check(safeURL(p.source.folderUrl) && (!p.source.url || safeURL(p.source.url)), 'URL del origen procesado inválida.');
    }
    if (p.fingerprint !== null) validateMetadata(p.fingerprint);
    check(p.status !== 'processed' || (validInstant(p.processedAt) && p.source && p.fingerprint), 'Una lectura completa necesita fecha, responsable, origen y metadatos conservados.');
  }
  function summary(project) {
    const files = project.processedFiles || [], count = { total: files.length, processed: 0, skip: 0, read: 0, verify: 0, unavailable: 0 };
    for (const file of files) { if (file.processing.status === 'processed') count.processed++;count[evaluate(file, project.info.driveUrl).action]++; }
    return count;
  }
  function validateTransition(previous, next) {
    if (!previous || next.processing.status !== 'processed') return;
    const before = previous.processing, after = next.processing;
    const differs = (a,b,keys) => a === null || b === null ? a !== b : keys.some(key => a[key] !== b[key]);
    const changedBase = differs(before.source,after.source,['folderUrl','driveFileId','path','url']) || differs(before.fingerprint,after.fingerprint,Object.keys(metadata()));
    if ((changedBase || (before.forceReview && !after.forceReview) || before.status !== 'processed') && before.processedAt === after.processedAt) throw new Error('Para confirmar una nueva lectura o quitar la relectura solicitada debes registrar una nueva fecha de procesamiento.');
  }
  return { metadata, blank, complete, evaluate, validate, validateTransition, summary };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = CCMFiles;
