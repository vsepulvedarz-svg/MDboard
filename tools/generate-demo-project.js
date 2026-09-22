'use strict';

const fs = require('node:fs');
const path = require('node:path');
const CCM = require('../model.js');

const output = path.resolve(__dirname, '..', 'projects', 'prj_demo_50.json');
const actor = 'Generador de datos mock';
const createdAt = '2026-09-22T15:00:00.000Z';

const project = CCM.createProject({
  client: 'Minera Horizonte SpA (DEMO)',
  buyer: 'Ingeniería Andina EPC (DEMO)',
  name: 'Ampliación Planta Solar Atacama – Fase II (DEMO)',
  crm: 'CRM-DEMO-2026-050',
  location: 'Antofagasta, Chile',
  manager: 'Camila Torres (DEMO)',
  driveUrl: '',
  startDate: '2026-09-15',
  targetDate: '2026-11-30',
  technology: 'ccm_vdf',
  offerStatus: 'review',
  offerReason: 'Ejemplo ficticio al 50%; requiere completar antecedentes críticos antes de emitir una oferta firme.'
}, actor);

project.id = 'prj_demo_50';
project.version = 2;
project.createdAt = createdAt;
project.updatedAt = createdAt;
project.history[0] = {
  id: 'evt_demo_created',
  at: createdAt,
  actor,
  origin: 'manual',
  kind: 'project.created',
  reason: 'Creación de un proyecto ficticio para demostración.',
  changes: [{ path: 'info', before: null, after: CCM.clone(project.info) }]
};

const documentByPillar = new Map([
  [1, 'doc_demo_comercial'],
  [2, 'doc_demo_entrada'],
  [3, 'doc_demo_unilineal'],
  [4, 'doc_demo_centerline'],
  [5, 'doc_demo_flexline']
]);

project.documents = [
  ['doc_demo_comercial', 'Bases comerciales DEMO.pdf', '01_Comercial/Bases_comerciales_DEMO.pdf', 'bases-comerciales'],
  ['doc_demo_entrada', 'Listado de antecedentes DEMO.xlsx', '02_Entrada/Listado_antecedentes_DEMO.xlsx', 'antecedentes-entrada'],
  ['doc_demo_unilineal', 'Diagrama unilineal DEMO Rev. B.pdf', '03_Ingenieria/Unilineal_DEMO_RevB.pdf', 'unilineal'],
  ['doc_demo_centerline', 'Especificación CENTERLINE DEMO.pdf', '04_CCM/Especificacion_CENTERLINE_DEMO.pdf', 'centerline'],
  ['doc_demo_flexline', 'Especificación FLEXLINE DEMO.pdf', '05_VDF/Especificacion_FLEXLINE_DEMO.pdf', 'flexline']
].map(([id, name, documentPath, familyId]) => ({
  id,
  name,
  path: documentPath,
  familyId,
  revision: 'B',
  url: '',
  notes: 'Documento completamente ficticio utilizado solo para mostrar la interfaz.',
  mimeType: name.endsWith('.xlsx')
    ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    : 'application/pdf',
  readStatus: 'read',
  updatedAt: createdAt,
  updatedBy: actor,
  manualLock: true
}));

// Se excluye un control no crítico del pilar 3. Quedan 144 controles aplicables;
// 72 disponibles equivalen exactamente a 50%.
const excluded = project.checklist.find(item => item.pillar === 3 && !item.critical);
excluded.state = 'not_applicable';
excluded.notes = 'No aplica al alcance ficticio de esta fase del proyecto.';
excluded.updatedAt = createdAt;
excluded.updatedBy = actor;
excluded.source = 'manual';

const availableQuota = new Map([[1, 6], [2, 4], [3, 48], [4, 7], [5, 7]]);
const availableCount = new Map();
let pendingIndex = 0;

for (const item of project.checklist) {
  if (item === excluded) continue;
  const used = availableCount.get(item.pillar) || 0;
  if (used < availableQuota.get(item.pillar)) {
    const documentId = documentByPillar.get(item.pillar);
    const document = project.documents.find(entry => entry.id === documentId);
    item.state = 'available';
    item.value = `Dato mock validado para ${item.id}.`;
    item.notes = 'Valor ficticio cargado para demostrar el avance del diagnóstico.';
    item.evidence = [{
      id: `ev_demo_${item.id}`,
      documentId,
      fileName: document.name,
      path: document.path,
      revision: document.revision,
      locator: `Sección DEMO · control ${item.id}`,
      quote: `Evidencia ficticia de demostración para el control ${item.id}.`,
      url: ''
    }];
    availableCount.set(item.pillar, used + 1);
  } else {
    item.state = item.critical || pendingIndex % 3 === 0 ? 'missing' : pendingIndex % 3 === 1 ? 'partial' : 'unreviewed';
    item.value = item.state === 'partial' ? 'Antecedente mock incompleto.' : '';
    item.notes = item.state === 'missing'
      ? 'Pendiente de confirmación del cliente (dato ficticio).'
      : item.state === 'partial'
        ? 'Se requiere complementar la información ficticia.'
        : '';
    pendingIndex += 1;
  }
  if (item.state !== 'unreviewed') {
    item.updatedAt = createdAt;
    item.updatedBy = actor;
    item.source = 'manual';
  }
}

project.queries = [
  {
    id: 'qry_demo_01',
    title: 'Confirmar corriente de cortocircuito',
    question: '¿Se confirma el valor de cortocircuito disponible en la barra principal?',
    assignedTo: 'Ingeniería Andina EPC (DEMO)',
    status: 'open',
    resolution: '',
    closedAt: null,
    createdAt,
    createdBy: actor,
    relatedChecklistIds: ['r3-01'],
    evidence: [],
    messages: [],
    updatedAt: createdAt,
    updatedBy: actor,
    manualLock: true
  },
  {
    id: 'qry_demo_02',
    title: 'Validar protocolo de comunicaciones',
    question: '¿El sistema de control utilizará EtherNet/IP o Modbus TCP?',
    assignedTo: 'Automatización del cliente (DEMO)',
    status: 'open',
    resolution: '',
    closedAt: null,
    createdAt,
    createdBy: actor,
    relatedChecklistIds: ['r3-02'],
    evidence: [],
    messages: [],
    updatedAt: createdAt,
    updatedBy: actor,
    manualLock: true
  },
  {
    id: 'qry_demo_03',
    title: 'Definir tensión de control',
    question: '¿Cuál será la tensión de control del tablero?',
    assignedTo: 'Cliente final (DEMO)',
    status: 'closed',
    resolution: 'Para el ejemplo se definió 110 VCA.',
    closedAt: '2026-09-22T16:00:00.000Z',
    createdAt,
    createdBy: actor,
    relatedChecklistIds: ['r3-03'],
    evidence: [],
    messages: [{
      id: 'msg_demo_01',
      at: '2026-09-22T16:00:00.000Z',
      author: 'Cliente DEMO',
      body: 'Para el ejemplo se definió 110 VCA.',
      evidence: []
    }],
    updatedAt: createdAt,
    updatedBy: actor,
    manualLock: true
  }
];

project.team = [
  ['person_demo_01', 'Camila Torres (DEMO)', 'Gerente de proyecto', 'CCM/VDF Demo', '+56 9 0000 0001', 'camila.torres@example.com'],
  ['person_demo_02', 'Diego Morales (DEMO)', 'Ingeniero eléctrico', 'Ingeniería Andina Demo', '+56 9 0000 0002', 'diego.morales@example.com'],
  ['person_demo_03', 'Sofía Rojas (DEMO)', 'Especialista de automatización', 'Minera Horizonte Demo', '+56 9 0000 0003', 'sofia.rojas@example.com']
].map(([id, name, role, company, phone, email]) => ({
  id,
  name,
  role,
  company,
  phone,
  email,
  notes: 'Contacto completamente ficticio para demostración.',
  updatedAt: createdAt,
  updatedBy: actor,
  manualLock: true
}));

project.history.push({
  id: 'evt_demo_seeded',
  at: createdAt,
  actor,
  origin: 'manual',
  kind: 'demo.seeded',
  reason: 'Carga de datos mock para presentar el dashboard con 50% de avance.',
  changes: [{
    path: 'demo',
    before: null,
    after: { available: 72, applicable: 144, progress: 50, documents: 5, queries: 3, team: 3 }
  }]
});

CCM.validateProject(project);
if (CCM.progress(project) !== 50) throw new Error(`El avance esperado era 50%, se obtuvo ${CCM.progress(project)}%.`);

fs.writeFileSync(output, `${JSON.stringify(project, null, 2)}\n`, 'utf8');
console.log(`Proyecto demo generado: ${output}`);
console.log(`Avance: ${CCM.progress(project)}% (${project.checklist.filter(item => item.state === 'available').length} disponibles).`);
