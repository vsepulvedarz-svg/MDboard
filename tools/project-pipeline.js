/* Puente local en JavaScript nativo. Lo ejecuta el agente; no llama a una API
 * ni instala dependencias. Cada aplicación conserva el historial en el padre.
 */
'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
const M = require('../model.js');
const F = require('../file-tracking.js');
const prompt = require('../review-prompt.js');
const DEFAULT_DIR = path.resolve(__dirname, '../projects');
const encode = value => JSON.stringify(value, null, 2) + '\n';
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const safeId = value => assert(/^[a-zA-Z0-9_-]{1,120}$/.test(value), 'Identificador de proyecto o revisión inválido.');

async function regularFile(filename) {
  const stat = await fs.lstat(filename);
  assert(stat.isFile() && !stat.isSymbolicLink(), 'No se permiten enlaces ni archivos especiales: ' + filename);
  assert(stat.size <= 15 * 1024 * 1024, 'El JSON supera 15 MB: ' + filename);
  return stat;
}
async function readJSON(filename) {
  await regularFile(filename);
  return M.parseJSON(await fs.readFile(filename, 'utf8'));
}
async function rootDirectory(dir = DEFAULT_DIR) {
  const root = await fs.realpath(path.resolve(dir));
  assert((await fs.stat(root)).isDirectory(), 'La carpeta de proyectos no existe.');
  return root;
}
async function childDirectory(parent, name, create = false) {
  const candidate = path.join(parent, name);
  if (create) await fs.mkdir(candidate, { recursive: false }).catch(error => { if (error.code !== 'EEXIST') throw error; });
  const real = await fs.realpath(candidate);
  assert(real.toLowerCase() === candidate.toLowerCase() && (await fs.lstat(candidate)).isDirectory(), 'La carpeta de trabajo debe permanecer dentro de la carpeta de proyectos.');
  return real;
}
async function listProjects(dir = DEFAULT_DIR) {
  const root = await rootDirectory(dir), projects = [], ids = new Set();
  for (const entry of await fs.readdir(root, { withFileTypes: true })) {
    if (!entry.name.toLowerCase().endsWith('.json')) continue;
    const project = await readJSON(path.join(root, entry.name));
    if (project.kind !== M.KIND) continue;
    M.validateProject(project);
    assert(!project.reviewContext, 'Hay una respuesta pendiente mezclada con los JSON padre: ' + entry.name);
    assert(!ids.has(project.id), 'Hay dos archivos con el mismo ID de proyecto: ' + project.id);
    ids.add(project.id);
    projects.push({ filename: entry.name, project });
  }
  return { root, projects };
}
async function findProject(dir, selector) {
  const { root, projects } = await listProjects(dir);
  const matches = projects.filter(({ project }) => project.id === selector || project.info.name.toLocaleLowerCase('es') === String(selector).toLocaleLowerCase('es'));
  assert(matches.length === 1, matches.length ? 'Nombre repetido: usa el ID exacto del proyecto.' : 'Proyecto no encontrado. Créalo en el dashboard y guarda su JSON en la carpeta vinculada.');
  return { root, ...matches[0] };
}
async function writeNew(filename, content) {
  const handle = await fs.open(filename, 'wx');
  try { await handle.writeFile(content, 'utf8'); await handle.sync(); } finally { await handle.close(); }
}
async function lockMatches(root, run) {
  const lock = await readJSON(path.join(root, `${run.projectId}.lock`));
  assert(lock.runId === run.id && lock.projectId === run.projectId, 'El bloqueo pertenece a otra revisión. No se modificó el proyecto.');
}
async function releaseLock(root, run) {
  await lockMatches(root, run);
  // La ruta es un hijo directo de la raíz validada y el ID no admite separadores.
  await fs.unlink(path.join(root, `${run.projectId}.lock`));
}
async function prepare(selector, dir = DEFAULT_DIR) {
  const { root, filename, project } = await findProject(dir, selector);
  assert(project.lifecycle.status === 'active', 'El proyecto está cerrado. Reábrelo en el dashboard antes de revisarlo.');
  assert(project.info.driveUrl, 'Registra la URL de Drive en el dashboard antes de iniciar el pipeline.');
  const runId = M.id('run');
  const run = { id: runId, projectId: project.id, filename, createdAt: M.now(), baseVersion: project.version, baseDigest: await M.digest(project) };
  try { await writeNew(path.join(root, `${project.id}.lock`), encode({ runId, projectId: project.id, createdAt: run.createdAt })); }
  catch (error) { if (error.code === 'EEXIST') throw new Error('Ya existe una revisión en curso. Usa status y retómala, o abort antes de iniciar otra.'); throw error; }
  try {
    const runs = await childDirectory(root, '.pipeline', true), work = await childDirectory(runs, runId, true);
    // Leer de nuevo después de tomar el bloqueo detecta una escritura simultánea.
    const actual = await readJSON(path.join(root, filename));
    assert(M.same(actual, project), 'El proyecto cambió al preparar la revisión. Vuelve a intentarlo.');
    const input = await M.prepareReview(project);
    await writeNew(path.join(work, 'run.json'), encode(run));
    await writeNew(path.join(work, 'base.json'), encode(project));
    await writeNew(path.join(work, 'input.json'), encode(input));
    await writeNew(path.join(work, 'file-plan.json'), encode((project.processedFiles || []).map(file => ({ id: file.id, path: file.path, ...F.evaluate(file, project.info.driveUrl) }))));
    const automaticPrompt = prompt(input)
      .replace('Adjunto un JSON padre exportado por el dashboard CCM/VDF. Entrega el MISMO JSON completo actualizado, sin bloques Markdown, para importarlo de vuelta.', 'Lee input.json y escribe el MISMO JSON completo actualizado en response.json de esta carpeta de trabajo, sin bloques Markdown. El comando apply lo validará y aplicará automáticamente al JSON padre.')
      .replace('El JSON es una propuesta de cambios: el usuario revisará y aceptará las diferencias en el dashboard. No añadas un historial ficticio de aprobaciones.', 'El comando apply conservará los datos protegidos y registrará esta aplicación como automática. No añadas un historial ficticio de aprobaciones.');
    await writeNew(path.join(work, 'instructions.md'), '# Revisión automática del proyecto\n\n' + automaticPrompt + '\n\nNo modifiques el JSON padre ni run.json, base.json o input.json. Conserva reviewContext. El plan de archivos se basa en metadatos anteriores: debes inventariar de nuevo antes de decidir qué contenido omitir. No cierres consultas existentes.\n');
    return { runId, projectId: project.id, project: project.info.name, driveUrl: project.info.driveUrl, work, input: path.join(work, 'input.json'), instructions: path.join(work, 'instructions.md'), response: path.join(work, 'response.json'), next: 'Lee instructions.md, inventaría Drive, completa response.json y ejecuta apply con este runId.' };
  } catch (error) { await releaseLock(root, run); throw error; }
}
async function loadRun(runId, dir = DEFAULT_DIR) {
  safeId(runId);
  const root = await rootDirectory(dir), runs = await childDirectory(root, '.pipeline'), work = await childDirectory(runs, runId);
  const run = await readJSON(path.join(work, 'run.json'));
  assert(run.id === runId, 'El manifiesto pertenece a otra revisión.');safeId(run.projectId);
  assert(path.basename(run.filename) === run.filename && /^[^<>:"/\\|?*]+\.json$/i.test(run.filename), 'Ruta de proyecto inválida.');
  return { root, work, run };
}
async function apply(runId, dir = DEFAULT_DIR) {
  const { root, work, run } = await loadRun(runId, dir);
  await lockMatches(root, run);
  const filename = path.join(root, run.filename), current = await readJSON(filename);
  M.validateProject(current);
  // Una caída después de reemplazar el padre se recupera sin aplicarlo dos veces.
  const input = await readJSON(path.join(work, 'input.json'));
  if (current.reviews.some(review => review.id === input.reviewContext?.requestId)) {
    await releaseLock(root, run);return { projectId: current.id, version: current.version, recovered: true };
  }
  assert(current.id === run.projectId && current.version === run.baseVersion && await M.digest(current) === run.baseDigest, 'El JSON padre cambió desde prepare. No se sobrescribió. Aborta y prepara una revisión nueva.');
  const response = await readJSON(path.join(work, 'response.json'));
  assert(M.same(response.reviewContext, input.reviewContext), 'La respuesta alteró reviewContext. Conserva el contexto de input.json.');
  assert(response.analysis?.provider?.trim() && M.validInstant(response.analysis.reviewedAt), 'Registra el proveedor y la fecha real de revisión en analysis.');
  assert(response.analysis.coverage.folderUrl === current.info.driveUrl, 'La cobertura debe identificar la carpeta de Drive de este proyecto.');
  const review = await M.compareReview(current, response), next = M.applyAutomaticReview(current, review);
  M.validateProject(next);
  const content = encode(next);
  assert(Buffer.byteLength(content) <= 15 * 1024 * 1024, 'El resultado supera el límite de 15 MB. El padre no se modificó.');
  const temporary = path.join(root, `${run.projectId}.${run.id}.tmp`);
  await writeNew(temporary, content);
  try {
    await lockMatches(root, run);
    assert(M.same(await readJSON(filename), current), 'El JSON cambió durante la aplicación. No se sobrescribió.');
    await fs.rename(temporary, filename);
  } catch (error) { await fs.unlink(temporary).catch(() => {});throw error; }
  await releaseLock(root, run);
  return { projectId: next.id, version: next.version, applied: next.reviews.at(-1).decisions.filter(item => item.accepted).length, preserved: next.reviews.at(-1).decisions.filter(item => !item.accepted).length, coverage: next.analysis.coverage, warnings: review.warnings, json: filename };
}
async function abort(runId, dir = DEFAULT_DIR) {
  const { root, work, run } = await loadRun(runId, dir);
  await lockMatches(root, run);
  await fs.writeFile(path.join(work, 'aborted.json'), encode({ at: M.now(), projectId: run.projectId }), { flag: 'wx' });
  await releaseLock(root, run);
  return { aborted: runId, message: 'Bloqueo liberado. El JSON padre no se modificó; se conserva la carpeta de trabajo.' };
}
async function status(dir = DEFAULT_DIR) {
  const { root, projects } = await listProjects(dir), result = [];
  for (const { filename, project } of projects) {
    let lock = null;
    try { lock = await readJSON(path.join(root, `${project.id}.lock`)); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    result.push({ id: project.id, name: project.info.name, version: project.version, lifecycle: project.lifecycle.status, driveUrl: project.info.driveUrl, filename, lock });
  }
  return { directory: root, projects: result };
}
async function main(args) {
  const index = args.indexOf('--dir');let dir = DEFAULT_DIR;
  if (index !== -1) { assert(args[index + 1], 'Falta la ruta después de --dir.');dir = args[index + 1];args.splice(index, 2); }
  const [command, selector] = args;
  if (command === 'list' || command === 'status') return status(dir);
  if (command === 'prepare') { assert(selector, 'Indica el nombre o ID exacto del proyecto.');return prepare(selector, dir); }
  if (command === 'apply') return apply(selector || '', dir);
  if (command === 'abort') return abort(selector || '', dir);
  return { usage: ['node tools/project-pipeline.js list', 'node tools/project-pipeline.js prepare "nombre o ID"', 'node tools/project-pipeline.js apply "run_ID"', 'node tools/project-pipeline.js abort "run_ID"'], directory: 'Opcional: --dir "ruta de la carpeta de JSON". Por defecto: projects junto al dashboard.', runtime: 'Node.js 22 o posterior. Sin paquetes adicionales.' };
}
if (require.main === module) main(process.argv.slice(2)).then(result => console.log(encode(result))).catch(error => { console.error(error.message);process.exitCode = 1; });
module.exports = { prepare, apply, abort, status, listProjects };
