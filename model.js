/* Modelo de dominio compartido por el navegador y las pruebas de Node.
 * Sin librerías. Las funciones devuelven copias y no escriben en almacenamiento.
 */
var CCM = (() => {
  'use strict';
  const catalog = typeof CCM_CATALOG !== 'undefined' ? CCM_CATALOG : require('./catalog.js');
  const calendarTemplate = typeof CCM_CALENDAR !== 'undefined' ? CCM_CALENDAR : require('./calendar.js');
  const files = typeof CCMFiles !== 'undefined' ? CCMFiles : require('./file-tracking.js');
  const KIND = 'ccm-vdf-project';
  const SCHEMA_VERSION = 1;
  const STATES = ['unreviewed', 'available', 'missing', 'partial', 'conflict', 'not_applicable'];
  const OFFER_STATES = ['unreviewed', 'firm', 'reference', 'blocked', 'review'];
  const COLLECTIONS = ['documents', 'revisions', 'queries', 'team', 'processedFiles'];
  const clone = value => JSON.parse(JSON.stringify(value));
  const now = () => new Date().toISOString();
  const id = prefix => `${prefix}_${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2)}`;
  const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const canonical = value => JSON.stringify(value, (_, item) => isRecord(item) ? Object.keys(item).sort().reduce((out, key) => { out[key] = item[key]; return out; }, {}) : item);
  const same = (a, b) => canonical(a) === canonical(b);
  const requireCondition = (condition, message) => { if (!condition) throw new Error(message); };
  const text = (value, name, required = false, max = 20000) => {
    requireCondition(typeof value === 'string' && value.length <= max && (!required || value.trim().length > 0), `${name}: texto ${required ? 'obligatorio ' : ''}inválido.`);
  };
  const safeId = (value, name = 'ID') => requireCondition(typeof value === 'string' && /^[a-zA-Z0-9_-]{1,120}$/.test(value), `${name}: identificador inválido.`);
  const array = (value, name, max = 20000) => requireCondition(Array.isArray(value) && value.length <= max, `${name}: lista inválida o demasiado grande.`);
  const validDate = value => {
    if (typeof value !== 'string' || !/^20\d{2}-\d{2}-\d{2}$/.test(value)) return false;
    const parsed = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  };
  const validInstant = value => typeof value === 'string' && /^\d{4}-\d\d-\d\dT/.test(value) && !Number.isNaN(Date.parse(value));
  const safeURL = value => {
    if (!value) return '';
    try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : ''; } catch { return ''; }
  };
  const today = () => {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
    const get = type => parts.find(part => part.type === type).value;
    return `${get('year')}-${get('month')}-${get('day')}`;
  };
  function parseJSON(source) {
    requireCondition(typeof source === 'string' && source.length <= 15 * 1024 * 1024, 'El JSON supera el límite de 15 MB.');
    return JSON.parse(source.replace(/^\uFEFF/, ''), (key, value) => {
      requireCondition(!['__proto__', 'constructor', 'prototype'].includes(key), 'El archivo contiene una clave no permitida.');
      return value;
    });
  }
  function assertUnique(entries, name) {
    array(entries, name);
    const ids = new Set();
    entries.forEach(entry => {
      requireCondition(isRecord(entry), `${name}: registro inválido.`);
      safeId(entry.id, `${name}.id`);
      requireCondition(!ids.has(entry.id), `${name}: ID duplicado ${entry.id}.`);
      ids.add(entry.id);
    });
  }
  function validateEvidence(entries, documents = null) {
    assertUnique(entries, 'Evidencias');
    entries.forEach(entry => {
      ['fileName', 'locator', 'quote'].forEach(key => text(entry[key], `Evidencia: ${key}`, true));
      ['path', 'revision', 'url'].forEach(key => text(entry[key] ?? '', `Evidencia: ${key}`));
      requireCondition(!entry.url || safeURL(entry.url), 'La URL de la evidencia debe usar http o https.');
      if (entry.documentId) {
        safeId(entry.documentId);
        if (documents) requireCondition(documents.some(doc => doc.id === entry.documentId), `La evidencia cita un documento no registrado: ${entry.documentId}. Incluye también ese documento.`);
      }
    });
  }
  function validateCalendar(calendar) {
    requireCondition(isRecord(calendar) && calendar.country === 'CL' && calendar.timeZone === 'America/Santiago' && calendar.countingRule === 'exclude_start_include_end', 'Calendario incompatible: debe excluir el día inicial y usar Chile.');
    array(calendar.coverage, 'Cobertura del calendario', 100);
    const years = new Set();
    calendar.coverage.forEach(entry => {
      requireCondition(Number.isInteger(entry.year) && entry.year >= 2000 && entry.year < 2100 && typeof entry.complete === 'boolean' && !years.has(entry.year), 'Cobertura anual inválida o duplicada.');
      years.add(entry.year);
      text(entry.source, 'Fuente del calendario', entry.complete);
      requireCondition(!entry.complete || validDate(entry.verifiedAt), 'Indica cuándo se verificó el calendario anual.');
    });
    assertUnique(calendar.holidays, 'Feriados');
    calendar.holidays.forEach(holiday => {
      requireCondition(validDate(holiday.date), 'Un feriado tiene una fecha inválida.');
      text(holiday.name, 'Nombre del feriado', true, 300);
      text(holiday.source, 'Fuente del feriado', true);
      requireCondition(['national', 'regional', 'local', 'company'].includes(holiday.scope), 'Alcance de feriado inválido.');
    });
  }
  function businessDaysBetween(start, end, calendar) {
    requireCondition(validDate(start) && validDate(end), 'Se requieren fechas válidas para calcular los días hábiles.');
    requireCondition(end >= start, 'La fecha final no puede ser anterior al inicio.');
    const dayMs = 86400000;
    const from = Date.parse(`${start}T00:00:00Z`), to = Date.parse(`${end}T00:00:00Z`);
    requireCondition(to - from <= 100 * 366 * dayMs, 'El intervalo no puede superar 100 años.');
    const holidays = new Map(calendar.holidays.map(holiday => [holiday.date, holiday]));
    const covered = new Set(calendar.coverage.filter(entry => entry.complete).map(entry => entry.year));
    const missingYears = new Set(), excludedHolidays = [];
    let days = 0, weekends = 0;
    for (let time = from + dayMs; time <= to; time += dayMs) {
      const date = new Date(time), iso = date.toISOString().slice(0, 10);
      if (!covered.has(date.getUTCFullYear())) missingYears.add(date.getUTCFullYear());
      if ([0, 6].includes(date.getUTCDay())) { weekends++; continue; }
      if (holidays.has(iso)) { excludedHolidays.push(clone(holidays.get(iso))); continue; }
      days++;
    }
    return { days, calendarDays: (to - from) / dayMs, weekendDays: weekends, holidayDays: excludedHolidays.length, excludedHolidays, missingYears: [...missingYears], complete: !missingYears.size, rule: 'exclude_start_include_end' };
  }
  function elapsed(project, end = today()) {
    if (project.lifecycle.status === 'closed') return { ...clone(project.lifecycle.closure.calculation), frozen: true };
    if (!project.info.startDate) return null;
    if (project.info.startDate > end) return { days: 0, complete: true, missingYears: [], notStarted: true };
    return businessDaysBetween(project.info.startDate, end, project.calendar);
  }
  const blankAnalysis = () => ({ provider: '', model: '', reviewedAt: '', summary: '', coverage: { folderUrl: '', recursive: false, discovered: 0, read: 0, reused: 0, unreadable: [], notes: '' } });
  function createProject(info = {}, actor = 'Usuario local') {
    const at = now();
    const project = {
      kind: KIND, schemaVersion: SCHEMA_VERSION, templateVersion: catalog.version,
      id: id('prj'), version: 1, createdAt: at, updatedAt: at,
      info: { client: '', buyer: '', name: '', crm: '', location: '', manager: '', driveUrl: '', startDate: '', targetDate: '', technology: 'undetermined', offerStatus: 'unreviewed', offerReason: '', ...info },
      lifecycle: { status: 'active', closure: null },
      calendar: clone(calendarTemplate),
      checklist: catalog.requirements.map(requirement => ({
        ...clone(requirement), state: 'unreviewed', value: '', notes: '', evidence: [], manualLock: false,
        updatedAt: null, updatedBy: '', source: 'unreviewed'
      })),
      documents: [], revisions: [], queries: [], team: [], processedFiles: [], history: [], reviews: [],
      analysis: blankAnalysis(), reviewContext: null
    };
    project.history.push({ id: id('evt'), at, actor, origin: 'manual', kind: 'project.created', reason: 'Creación del proyecto con checklist sin revisar.', changes: [{ path: 'info', before: null, after: clone(project.info) }] });
    validateProject(project);
    return project;
  }
  function progress(project, pillar = null) {
    const applicable = project.checklist.filter(item => (!pillar || item.pillar === pillar) && item.state !== 'not_applicable');
    return applicable.length ? Math.round(applicable.filter(item => item.state === 'available').length / applicable.length * 100) : null;
  }
  const blockers = project => project.checklist.filter(item => item.critical && !['available', 'not_applicable'].includes(item.state));
  function validateRecord(collection, entry) {
    safeId(entry.id);
    if (collection === 'processedFiles') {
      files.validate(entry, { text, requireCondition, isRecord, validInstant, safeURL });
    } else if (collection === 'documents') {
      ['name', 'path', 'familyId', 'revision', 'url', 'notes'].forEach(key => text(entry[key], `Documento: ${key}`, key === 'name'));
      requireCondition(!entry.url || safeURL(entry.url), 'URL de documento no válida.');
      requireCondition(['read', 'unreadable', 'metadata_only', 'not_reviewed'].includes(entry.readStatus), 'Estado de lectura del documento inválido.');
      text(entry.mimeType, 'Tipo de documento');
    } else if (collection === 'revisions') {
      ['familyId', 'fromRevision', 'toRevision', 'summary', 'justification', 'impact', 'fromDocumentId', 'toDocumentId'].forEach(key => text(entry[key], `Revisión: ${key}`, ['familyId', 'fromRevision', 'toRevision', 'summary'].includes(key)));
      requireCondition(entry.fromRevision !== entry.toRevision, 'Las revisiones de origen y destino deben ser diferentes.');
      requireCondition(['documented', 'inferred', 'unknown'].includes(entry.justificationStatus), 'Clasifica la justificación como documentada, inferida o desconocida.');
      requireCondition(entry.justificationStatus === 'unknown' || entry.justification.trim(), 'Falta la justificación del cambio.');
      validateEvidence(entry.evidence);
      requireCondition(entry.justificationStatus !== 'documented' || entry.evidence.length > 0, 'Una justificación documentada necesita evidencia.');
    } else if (collection === 'team') {
      ['name', 'role', 'company', 'phone', 'email', 'notes'].forEach(key => text(entry[key], `Contacto: ${key}`, key === 'name', 3000));
      requireCondition(!entry.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry.email), 'Correo del contacto inválido.');
    } else if (collection === 'queries') {
      ['title', 'question', 'assignedTo', 'resolution'].forEach(key => text(entry[key], `Consulta: ${key}`, ['title', 'question'].includes(key)));
      requireCondition(['open', 'closed'].includes(entry.status), 'Estado de consulta inválido.');
      requireCondition(entry.status !== 'closed' || (entry.resolution.trim() && validInstant(entry.closedAt)), 'Para cerrar una consulta se requiere resolución y fecha de cierre.');
      requireCondition(entry.status !== 'open' || (entry.closedAt === null && !entry.resolution), 'Una consulta abierta no debe tener resolución de cierre vigente.');
      requireCondition(validInstant(entry.createdAt), 'Fecha de creación de consulta inválida.');
      text(entry.createdBy, 'Autor de la consulta', true);
      array(entry.relatedChecklistIds, 'Ítems relacionados');
      entry.relatedChecklistIds.forEach(value => safeId(value));
      validateEvidence(entry.evidence);
      assertUnique(entry.messages, 'Mensajes');
      entry.messages.forEach(message => {
        text(message.body, 'Mensaje', true); text(message.author, 'Autor', true);
        requireCondition(validInstant(message.at), 'Fecha de mensaje inválida.'); validateEvidence(message.evidence);
      });
    }
  }
  function validateProject(project) {
    requireCondition(isRecord(project) && project.kind === KIND && project.schemaVersion === SCHEMA_VERSION, 'No es un JSON de proyecto CCM/VDF compatible (schemaVersion 1).');
    safeId(project.id, 'ID de proyecto');
    requireCondition(Number.isSafeInteger(project.version) && project.version >= 1, 'Versión de proyecto inválida.');
    requireCondition(project.templateVersion === catalog.version, 'La versión de checklist no coincide con esta aplicación.');
    requireCondition(validInstant(project.createdAt) && validInstant(project.updatedAt), 'Fechas del proyecto inválidas.');
    requireCondition(isRecord(project.info), 'Faltan los datos del proyecto.');
    ['client', 'buyer', 'name', 'crm', 'location', 'manager', 'driveUrl', 'startDate', 'targetDate', 'offerReason'].forEach(key => text(project.info[key], `Proyecto: ${key}`));
    requireCondition(!project.info.driveUrl || safeURL(project.info.driveUrl), 'El vínculo de la carpeta debe usar http o https.');
    ['startDate', 'targetDate'].forEach(key => requireCondition(!project.info[key] || validDate(project.info[key]), `${key}: fecha inválida.`));
    requireCondition(!project.info.startDate || !project.info.targetDate || project.info.targetDate >= project.info.startDate, 'La fecha objetivo no puede ser anterior al ingreso.');
    requireCondition(['undetermined', 'ccm', 'vdf', 'ccm_vdf'].includes(project.info.technology), 'Tipo de solución inválido.');
    requireCondition(OFFER_STATES.includes(project.info.offerStatus), 'Condición de oferta inválida.');
    validateCalendar(project.calendar);
    COLLECTIONS.forEach(collection => { const entries = collection === 'processedFiles' && project[collection] === undefined ? [] : project[collection]; assertUnique(entries, collection); entries.forEach(entry => validateRecord(collection, entry)); });
    const trackedIds = new Set();
    (project.processedFiles || []).forEach(file => {
      requireCondition(!file.documentId || project.documents.some(doc => doc.id === file.documentId), 'El archivo procesado cita un documento no registrado.');
      const identity = file.driveFileId || file.url || file.path;
      const key = `${file.folderUrl}\n${identity}`;
      requireCondition(!trackedIds.has(key), 'El mismo archivo aparece duplicado en el inventario de la carpeta.');trackedIds.add(key);
    });
    assertUnique(project.checklist, 'Checklist');
    requireCondition(project.checklist.length === catalog.requirements.length, `El checklist debe conservar los ${catalog.requirements.length} controles y sus IDs. Usa "not_applicable" con justificación; no borres controles.`);
    const requirementMap = new Map(catalog.requirements.map(entry => [entry.id, entry]));
    project.checklist.forEach(item => {
      const template = requirementMap.get(item.id);
      requireCondition(Boolean(template), `Ítem desconocido: ${item.id}.`);
      ['label', 'criterion', 'section', 'page', 'pillar', 'critical', 'requirementSource'].forEach(key => requireCondition(same(item[key], template[key]), `No modifiques la definición del requisito ${item.id} (${key}).`));
      requireCondition(STATES.includes(item.state), `Estado de checklist inválido: ${item.id}.`);
      text(item.value, 'Valor'); text(item.notes, 'Observaciones');
      requireCondition(typeof item.manualLock === 'boolean', 'La protección manual debe ser true o false.');
      validateEvidence(item.evidence, project.documents);
      requireCondition(item.state !== 'available' || (item.value.trim() && item.evidence.length), `${item.id}: un dato disponible necesita valor y al menos una evidencia con archivo, ubicación y extracto.`);
      requireCondition(item.state !== 'not_applicable' || item.notes.trim(), `${item.id}: justifica por qué no aplica.`);
    });
    project.revisions.forEach(revision => {
      validateEvidence(revision.evidence, project.documents);
      for (const key of ['fromDocumentId', 'toDocumentId']) {
        if (revision[key]) requireCondition(project.documents.some(doc => doc.id === revision[key] && doc.familyId === revision.familyId && doc.revision === revision[key === 'fromDocumentId' ? 'fromRevision' : 'toRevision']), `La revisión cita un documento ajeno, inexistente o con otra revisión: ${revision[key]}.`);
      }
    });
    project.queries.forEach(query => {
      query.relatedChecklistIds.forEach(value => requireCondition(requirementMap.has(value), 'La consulta cita un requisito inexistente.'));
      validateEvidence(query.evidence, project.documents);
      query.messages.forEach(message => validateEvidence(message.evidence, project.documents));
    });
    assertUnique(project.history, 'Historial');
    project.history.forEach(event => {
      requireCondition(validInstant(event.at), 'Fecha de historial inválida.');
      ['actor', 'origin', 'kind', 'reason'].forEach(key => text(event[key], `Historial: ${key}`, true));
      array(event.changes, 'Cambios del historial');
      event.changes.forEach(change => { text(change.path, 'Ruta del cambio', true); requireCondition('before' in change && 'after' in change, 'El historial requiere valores anterior y nuevo.'); });
    });
    assertUnique(project.reviews, 'Revisiones de IA');
    requireCondition(isRecord(project.analysis) && isRecord(project.analysis.coverage), 'Falta el resumen de análisis de IA.');
    ['provider', 'model', 'reviewedAt', 'summary'].forEach(key => text(project.analysis[key], `Análisis: ${key}`));
    const coverage = project.analysis.coverage;
    requireCondition(typeof coverage.recursive === 'boolean' && Number.isSafeInteger(coverage.discovered) && coverage.discovered >= 0 && Number.isSafeInteger(coverage.read) && coverage.read >= 0 && coverage.read <= coverage.discovered, 'Cobertura de lectura de IA inválida.');
    requireCondition(coverage.reused === undefined || (Number.isSafeInteger(coverage.reused) && coverage.reused >= 0 && coverage.read + coverage.reused <= coverage.discovered), 'Los archivos leídos y reutilizados no pueden superar los descubiertos.');
    array(coverage.unreadable, 'Archivos no leídos'); coverage.unreadable.forEach(value => text(value, 'Archivo no leído', true));
    text(coverage.folderUrl, 'Carpeta revisada'); text(coverage.notes, 'Notas de cobertura');
    requireCondition(!coverage.folderUrl || safeURL(coverage.folderUrl), 'URL de cobertura inválida.');
    requireCondition(isRecord(project.lifecycle) && ['active', 'closed'].includes(project.lifecycle.status), 'Estado de ciclo de vida inválido.');
    if (project.lifecycle.status === 'closed') {
      const closure = project.lifecycle.closure;
      requireCondition(isRecord(closure) && validDate(closure.date) && validDate(closure.startDate) && closure.date >= closure.startDate, 'Datos de cierre inválidos.');
      requireCondition(validInstant(closure.at) && closure.date <= today() && ['sent','won','lost','cancelled','completed'].includes(closure.outcome), 'Fecha o resultado del cierre inválido.');
      text(closure.reason, 'Motivo de cierre', true); text(closure.actor, 'Responsable del cierre', true);
      validateCalendar(closure.calendarSnapshot);
      const calculation = businessDaysBetween(closure.startDate, closure.date, closure.calendarSnapshot);
      requireCondition(calculation.complete && same(closure.calculation, calculation), 'El conteo de cierre no coincide con su calendario guardado.');
      requireCondition(closure.startDate === project.info.startDate, 'La fecha de inicio fue modificada después del cierre.');
    } else requireCondition(project.lifecycle.closure === null, 'Un proyecto activo no debe tener un cierre vigente.');
    return project;
  }
  function changeProject(project, kind, reason, actor, mutate, origin = 'manual') {
    requireCondition(project.lifecycle.status === 'active' || kind === 'project.reopened', 'El proyecto está cerrado. Reábrelo para modificarlo.');
    text(reason, 'Motivo del cambio', true); text(actor, 'Responsable', true);
    const next = clone(project), at = now();
    next.processedFiles ??= [];
    const changes = mutate(next, at);
    requireCondition(Array.isArray(changes) && changes.length > 0, 'No hay cambios para guardar.');
    next.version = project.version + 1;
    next.updatedAt = at;
    next.reviewContext = null;
    next.history.push({ id: id('evt'), at, actor, origin, kind, reason: reason.trim(), changes: clone(changes) });
    validateProject(next);
    return next;
  }
  function updateInfo(project, info, reason, actor) {
    return changeProject(project, 'project.updated', reason, actor, next => {
      const before = clone(next.info);
      Object.keys(before).forEach(key => { if (key in info) next.info[key] = info[key]; });
      if (next.info.offerStatus === 'firm') requireCondition(blockers(next).length === 0, 'La guía impide marcar oferta firme mientras existan controles críticos sin resolver.');
      return [{ path: 'info', before, after: clone(next.info) }];
    });
  }
  function updateChecklist(project, itemId, values, reason, actor) {
    return changeProject(project, 'checklist.updated', reason, actor, (next, at) => {
      const item = next.checklist.find(entry => entry.id === itemId);
      requireCondition(Boolean(item), 'Ítem no encontrado.');
      const before = clone(item);
      ['state', 'value', 'notes', 'evidence', 'manualLock'].forEach(key => { if (key in values) item[key] = clone(values[key]); });
      Object.assign(item, { updatedAt: at, updatedBy: actor, source: 'manual' });
      const changes = [{ path: `checklist/${itemId}`, before, after: clone(item) }];
      if (next.info.offerStatus === 'firm' && blockers(next).length) {
        changes.push({ path: 'info/offerStatus', before: 'firm', after: 'blocked' });
        next.info.offerStatus = 'blocked';
      }
      return changes;
    });
  }
  function upsertRecord(project, collection, record, reason, actor) {
    requireCondition(COLLECTIONS.includes(collection), 'Colección inválida.');
    return changeProject(project, `${collection}.updated`, reason, actor, (next, at) => {
      if (collection === 'processedFiles') next.processedFiles ??= [];
      const index = next[collection].findIndex(entry => entry.id === record.id);
      const before = index < 0 ? null : clone(next[collection][index]);
      const after = { ...clone(record), updatedAt: at, updatedBy: actor, manualLock: true };
      if (collection === 'processedFiles') files.validateTransition(before, after);
      if (collection === 'queries' && before) requireCondition(same(before.messages, after.messages), 'Los mensajes previos no se editan. Agrega un nuevo seguimiento.');
      if (index < 0) next[collection].push(after); else next[collection][index] = after;
      return [{ path: `${collection}/${record.id}`, before, after: clone(after) }];
    });
  }
  function queryMessage(project, queryId, body, evidence, actor, action = 'message') {
    requireCondition(['message', 'closed', 'reopened'].includes(action), 'Acción de consulta inválida.');
    text(body, 'Seguimiento o resolución', true);
    return changeProject(project, `query.${action}`, body, actor, (next, at) => {
      const query = next.queries.find(entry => entry.id === queryId);
      requireCondition(Boolean(query), 'Consulta no encontrada.');
      requireCondition(action === 'reopened' ? query.status === 'closed' : query.status === 'open', 'El estado de la consulta cambió.');
      const before = clone(query);
      query.messages.push({ id: id('msg'), at, author: actor, body, evidence: clone(evidence) });
      if (action === 'closed') Object.assign(query, { status: 'closed', resolution: body, closedAt: at });
      if (action === 'reopened') Object.assign(query, { status: 'open', resolution: '', closedAt: null });
      query.manualLock = true;
      return [{ path: `queries/${queryId}`, before, after: clone(query) }];
    });
  }
  function addNote(project, body, evidence, actor) {
    validateEvidence(evidence, project.documents);
    return changeProject(project, 'note.added', body, actor, () => [{ path: 'notes', before: null, after: { body, evidence: clone(evidence) } }]);
  }
  function updateCalendar(project, calendar, reason, actor) {
    return changeProject(project, 'calendar.updated', reason, actor, next => {
      const before = clone(next.calendar); next.calendar = clone(calendar);
      return [{ path: 'calendar', before, after: clone(calendar) }];
    });
  }
  function closeProject(project, { date, outcome, reason, actor }) {
    requireCondition(validDate(date) && date <= today(), 'El cierre debe tener una fecha válida, no futura.');
    requireCondition(['sent', 'won', 'lost', 'cancelled', 'completed'].includes(outcome), 'Resultado de cierre inválido.');
    return changeProject(project, 'project.closed', reason, actor, (next, at) => {
      const calculation = businessDaysBetween(next.info.startDate, date, next.calendar);
      requireCondition(calculation.complete, `Faltan calendarios completos para: ${calculation.missingYears.join(', ')}. Verifica esos años antes de cerrar.`);
      if (next.info.offerStatus === 'firm') requireCondition(!blockers(next).length, 'La oferta firme mantiene requisitos críticos pendientes.');
      const before = clone(next.lifecycle);
      next.lifecycle = { status: 'closed', closure: { date, startDate: next.info.startDate, at, actor, reason, outcome, calculation, calendarSnapshot: clone(next.calendar), openQueries: next.queries.filter(query => query.status === 'open').length } };
      return [{ path: 'lifecycle', before, after: clone(next.lifecycle) }];
    });
  }
  function reopenProject(project, reason, actor) {
    requireCondition(project.lifecycle.status === 'closed', 'El proyecto ya está abierto.');
    return changeProject(project, 'project.reopened', reason, actor, next => {
      const before = clone(next.lifecycle); next.lifecycle = { status: 'active', closure: null };
      return [{ path: 'lifecycle', before, after: clone(next.lifecycle) }];
    });
  }
  async function digest(project) {
    const content = clone(project); content.reviewContext = null;
    requireCondition(typeof crypto !== 'undefined' && crypto.subtle, 'La revisión requiere un contexto seguro (localhost o HTTPS).');
    const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical(content)));
    return [...new Uint8Array(buffer)].map(byte => byte.toString(16).padStart(2, '0')).join('');
  }
  async function prepareReview(project) {
    requireCondition(project.lifecycle.status === 'active', 'Reabre el proyecto antes de solicitar una nueva revisión.');
    const exported = clone(project);
    exported.processedFiles ??= [];
    exported.reviewContext = { kind: 'ai-review', requestId: id('rev'), baseVersion: project.version, baseDigest: await digest(project), exportedAt: now() };
    return exported;
  }
  const checklistValues = item => ({ state: item.state, value: item.value, notes: item.notes, evidence: clone(item.evidence) });
  const recordValues = record => {
    const result = clone(record);
    ['updatedAt', 'updatedBy', 'manualLock'].forEach(key => delete result[key]);
    return result;
  };
  async function compareReview(current, incoming) {
    validateProject(incoming);
    requireCondition(current.lifecycle.status === 'active', 'No se puede aplicar una revisión a un proyecto cerrado.');
    requireCondition(incoming.id === current.id, 'El JSON corresponde a otro proyecto.');
    const context = incoming.reviewContext;
    requireCondition(isRecord(context) && context.kind === 'ai-review', 'Falta reviewContext. Exporta el proyecto con «Preparar revisión IA» antes de pedir modificaciones.');
    safeId(context.requestId);
    requireCondition(context.baseVersion === current.version && incoming.version === current.version && context.baseDigest === await digest(current), 'La revisión usa una versión anterior o distinta del proyecto. Exporta la versión actual y solicita actualizar la revisión; no se sobrescribieron datos.');
    requireCondition(!current.reviews.some(review => review.id === context.requestId), 'Esta revisión ya fue procesada.');
    const changes = [], warnings = [];
    for (const field of ['calendar', 'lifecycle', 'history', 'reviews', 'createdAt', 'updatedAt']) if (!same(current[field], incoming[field])) warnings.push(`Se conservará ${field}: la IA no puede reemplazar ese registro.`);
    for (const key of Object.keys(current.info)) {
      if (!same(current.info[key], incoming.info[key])) changes.push({ key: `info:${key}`, collection: 'info', id: key, label: `Proyecto · ${key}`, before: current.info[key], after: incoming.info[key], locked: Boolean(current.info[key]) });
    }
    for (const item of current.checklist) {
      const proposed = incoming.checklist.find(entry => entry.id === item.id);
      const before = checklistValues(item), after = checklistValues(proposed);
      if (!same(before, after)) changes.push({ key: `checklist:${item.id}`, collection: 'checklist', id: item.id, label: item.label, before, after, locked: item.manualLock });
    }
    for (const collection of COLLECTIONS) {
      const existing = new Map((current[collection] || []).map(entry => [entry.id, entry]));
      for (const proposed of incoming[collection] || []) {
        const previous = existing.get(proposed.id);
        let after = recordValues(proposed);
        if (collection === 'queries' && previous) {
          const messages = new Map(previous.messages.map(message => [message.id, message]));
          for (const message of proposed.messages) {
            if (messages.has(message.id)) requireCondition(same(messages.get(message.id), message), 'La revisión intentó modificar un mensaje anterior. Los seguimientos son inmutables.');
            else messages.set(message.id, message);
          }
          after = { ...after, createdAt: previous.createdAt, createdBy: previous.createdBy, messages: [...messages.values()] };
        }
        const before = previous ? recordValues(previous) : null;
        if (!same(before, after)) changes.push({ key: `${collection}:${proposed.id}`, collection, id: proposed.id, label: proposed.fileName || proposed.name || proposed.title || `${proposed.fromRevision} → ${proposed.toRevision}`, before, after, locked: previous?.manualLock || false });
      }
      const omitted = (current[collection] || []).filter(entry => !(incoming[collection] || []).some(other => other.id === entry.id));
      if (omitted.length) warnings.push(`Se conservarán ${omitted.length} registros de ${collection} omitidos por la revisión.`);
    }
    return { id: context.requestId, baseVersion: current.version, baseDigest: context.baseDigest, provider: incoming.analysis.provider || 'IA externa', model: incoming.analysis.model, analysis: clone(incoming.analysis), changes, warnings };
  }
  function applyReview(current, review, selectedKeys, actor, mode = 'manual') {
    requireCondition(current.version === review.baseVersion, 'El proyecto cambió mientras revisabas los resultados. Importa una revisión actualizada.');
    requireCondition(!current.reviews.some(entry => entry.id === review.id), 'La revisión ya fue procesada.');
    const selected = new Set(selectedKeys);
    const automatic = mode === 'automatic';
    const reason = automatic ? `${selected.size} cambios aplicados automáticamente por ${review.provider}. Se conservaron los ajustes protegidos.` : `${selected.size} cambios de ${review.provider} aceptados por ${actor}.`;
    return changeProject(current, 'ai.reviewed', reason, actor, (next, at) => {
      const applied = [];
      for (const change of review.changes.filter(entry => selected.has(entry.key))) {
        if (change.collection === 'info') next.info[change.id] = clone(change.after);
        else if (change.collection === 'checklist') {
          const item = next.checklist.find(entry => entry.id === change.id);
          Object.assign(item, clone(change.after), { updatedAt: at, updatedBy: `${review.provider} / ${actor}`, source: 'ai' });
        } else if (COLLECTIONS.includes(change.collection)) {
          if (change.collection === 'processedFiles') next.processedFiles ??= [];
          const index = next[change.collection].findIndex(entry => entry.id === change.id);
          const previous = index < 0 ? null : next[change.collection][index];
          const after = { ...clone(change.after), updatedAt: at, updatedBy: `${review.provider} / ${actor}`, manualLock: previous?.manualLock || false };
          if (change.collection === 'processedFiles') files.validateTransition(previous, after);
          if (index < 0) next[change.collection].push(after); else next[change.collection][index] = after;
        }
        applied.push({ path: `${change.collection}/${change.id}`, before: change.before, after: change.after });
      }
      // Una aceptación parcial no debe crear una caché que oculte resultados descartados.
      const rejectedContent = review.changes.some(change => ['checklist','documents','revisions','queries','team'].includes(change.collection) && !selected.has(change.key));
      if (rejectedContent) for (const change of review.changes.filter(change => change.collection === 'processedFiles' && selected.has(change.key))) {
        const file = next.processedFiles.find(entry => entry.id === change.id);
        if (file.processing.status === 'processed' && !same(change.before?.processing, change.after.processing)) {
          const before = clone(file.processing);file.processing.forceReview = true;
          applied.push({ path: `processedFiles/${file.id}/processing`, before, after: clone(file.processing) });
        }
      }
      if (next.info.offerStatus === 'firm' && blockers(next).length) {
        applied.push({ path: 'info/offerStatus', before: 'firm', after: 'blocked' });
        next.info.offerStatus = 'blocked';
      }
      next.analysis = clone(review.analysis);
      const receipt = { id: review.id, at, actor, mode, provider: review.provider, model: review.model, baseVersion: review.baseVersion, accepted: applied.length, analysis: clone(review.analysis), warnings: clone(review.warnings), decisions: review.changes.map(change => ({ ...clone(change), accepted: selected.has(change.key) })) };
      next.reviews.push(receipt);
      applied.push({ path: `reviews/${review.id}`, before: null, after: clone(receipt) });
      return applied;
    }, automatic ? 'ai_automation' : 'ai_review');
  }
  function applyAutomaticReview(current, review) {
    const selected = review.changes.filter(change => {
      if (change.collection === 'info') {
        // La carpeta, identidad y fechas son decisiones del usuario. Los campos
        // de diagnóstico pueden evolucionar si nunca fueron ajustados a mano.
        if (!['technology','offerStatus','offerReason'].includes(change.id)) return false;
        const defaults = { technology: 'undetermined', offerStatus: 'unreviewed', offerReason: '' };
        const manuallyChanged = current.history.some(event => event.origin === 'manual' && event.changes.some(entry =>
          entry.path === `info/${change.id}` || (entry.path === 'info' && !same(entry.before ? entry.before[change.id] : defaults[change.id],entry.after?.[change.id]))));
        return !manuallyChanged && (change.id !== 'technology' || change.before === 'undetermined' || current.history.some(event => event.origin !== 'manual' && event.changes.some(entry => entry.path === 'info/technology')));
      }
      // Estado, resolución y conversaciones existentes se gestionan manualmente.
      if (change.collection === 'queries') return !change.before && change.after.status === 'open';
      // El inventario debe poder confirmar una relectura solicitada manualmente.
      // Se permite actualizar observaciones, nunca reasignar identidad/carpeta.
      if (change.collection === 'processedFiles' && change.before) {
        return ['folderUrl','driveFileId'].every(key => !change.before[key] || change.before[key] === change.after[key]) &&
          (change.before.driveFileId || ['path','url'].every(key => change.before[key] === change.after[key]));
      }
      return !change.locked;
    }).map(change => change.key);
    return applyReview(current, review, selected, review.provider, 'automatic');
  }
  return { KIND, SCHEMA_VERSION, STATES, OFFER_STATES, COLLECTIONS, catalog, clone, canonical, same, id, now, today, validDate, validInstant, safeURL, parseJSON, validateEvidence, validateCalendar, validateProject, businessDaysBetween, elapsed, createProject, progress, blockers, updateInfo, updateChecklist, upsertRecord, queryMessage, addNote, updateCalendar, closeProject, reopenProject, prepareReview, compareReview, applyReview, applyAutomaticReview, digest, blankAnalysis };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = CCM;
