# Dashboard CCM/VDF

Base local en **HTML, CSS y JavaScript nativos**, sin frameworks ni librerías de interfaz. Mantiene cartera, indicadores, ficha del proyecto, cinco pilares, checklist y actividad.

Abre `index.html` en Chrome o Edge, o sirve esta carpeta en localhost. La interfaz no requiere instalación ni compilación. La cartera inicia vacía.

## Pipeline automático

**Nuevo proyecto → JSON en la carpeta vinculada → revisión del agente → aplicación validada → recarga del dashboard.**

1. Vincula `D:\DashboardMichelle\projects` con **Carpeta de proyectos**. El navegador necesita tu permiso para escribir archivos; al crear el primer proyecto también se solicita elegir la carpeta.
2. Crea el proyecto e indica la URL de sus antecedentes en Drive. Se guarda automáticamente un JSON completo con un ID propio y 145 controles sin revisar.
3. Desde Gemini CLI u otro agente con acceso local, indica la ruta de la aplicación y pide: **«Lee GEMINI.md y actualiza el proyecto X»**. El agente también debe disponer de acceso autorizado a Drive o a una carpeta de antecedentes sincronizada.
4. El agente ejecuta `tools/project-pipeline.js`, revisa documentos, escribe la respuesta y aplica el resultado. La interfaz detecta la nueva versión cada 5 segundos mientras está visible y al regresar a ella.

La [guía de inicio](INICIO_GEMINI/00_EMPEZAR_AQUI.md) explica la preparación y contiene mensajes para copiar. **Revisión con IA** también genera el mensaje con nombre, ID y URL del proyecto. El procedimiento del agente está en [GEMINI.md](GEMINI.md).

El comando auxiliar usa **JavaScript nativo con Node.js 22 o posterior**, sin dependencias ni servidor de aplicación. No realiza llamadas de IA, no instala Gemini ni conecta Drive. La lectura de DOCX, XLSX, PDF y correos corresponde a las herramientas disponibles en el agente. No se ha verificado una carpeta real de Drive.

## Archivos y recarga

Cada JSON padre se conserva en la raíz de la carpeta elegida; `.pipeline/` contiene las bases e intercambios de revisión. La aplicación mantiene además una copia por proyecto en el navegador. Intenta recordar la carpeta mediante IndexedDB y restaura la conexión cuando el permiso sigue vigente; si se pierde el permiso, hay que vincularla otra vez.

**Guardar todos** copia a la carpeta los proyectos que ya existían en el navegador. Sin carpeta vinculada, solo se guarda la copia del navegador. Si este no admite acceso a carpetas, se conservan importación y exportación manuales.

Una actualización externa válida debe ser una versión posterior del mismo proyecto y conservar el historial previo. Los archivos inválidos, duplicados, obsoletos o de ramas distintas se notifican sin reemplazar la copia local. Una revisión en curso impide editar ese proyecto; un formulario abierto antes de una actualización debe volver a abrirse sobre la nueva versión.

`prepare` conserva la base y crea el bloqueo. `apply` valida la respuesta, mantiene ajustes protegidos, incrementa la versión y registra los valores anteriores/nuevos como **actualización automática de IA**. `status` permite localizar un run interrumpido y `abort` libera su bloqueo cuando el agente anterior ya no está trabajando. No se trata de un bloqueo distribuido entre equipos sincronizados.

## Alternativa para un chat web

Un chat web no obtiene acceso de escritura a una carpeta local solo por recibir su ruta. En **Revisión con IA → Si trabajas desde un chat web → Exportar / importar con revisión manual** puedes descargar un JSON de revisión, entregar instrucciones y fuentes al chat e importar su respuesta para elegir cambios.

Las respuestas pendientes conservan `reviewContext` y no deben sustituir directamente al padre. Tanto el pipeline como la importación comprueban la versión base. La plantilla común es una referencia; crea cada proyecto desde la interfaz para obtener un ID único.

## Evitar releer archivos de Drive

En **Documentos / revisiones → Archivos procesados en Drive** puedes consultar o registrar qué archivos ya se analizaron. El JSON conserva:

- `info.driveUrl`: carpeta raíz del proyecto.
- `processedFiles[]`: inventario acumulado, con nombre, ruta completa relativa, carpeta raíz, enlace e ID de Drive por archivo.
- `observed`: últimos metadatos obtenidos del listado: modificación, tamaño, versión y huella, cuando estén disponibles.
- `processing`: resultado de lectura, fecha y responsable, copia del origen y metadatos de la versión realmente procesada, observaciones y solicitud de relectura.

Las instrucciones de **Revisión con IA** ahora piden una revisión incremental: listar primero los metadatos de la carpeta y subcarpetas, compararlos contra el JSON, y leer contenido solo cuando sea necesario. La carpeta debe volver a inventariarse para detectar archivos nuevos, cambios de versión o pérdida de acceso; el ahorro corresponde a la lectura de contenidos que no cambiaron.

| Resultado de la comparación | Siguiente paso |
| --- | --- |
| Lectura completa y metadatos iguales | Reutilizar información del JSON después de confirmar el listado actual. |
| Archivo nuevo o modificado | Leer y actualizar datos, evidencias y versión procesada. |
| Lectura parcial, fallida o pendiente | Completar o reintentar la lectura. |
| Identidad o metadatos insuficientes | Verificar o releer; no omitir por coincidir el nombre. |
| No localizado / retirado | Mantener el registro y la evidencia histórica; verificar acceso o traslado. |

Se compara ID de Drive y carpeta; sin ID se exige el mismo enlace y ruta. Para confirmar que no cambió debe existir una huella comparable, una versión de Drive con el mismo ID, o fecha de modificación **junto con tamaño**. Los documentos nativos de Google pueden usar su versión sin inventar tamaño ni huella. Si cambia una señal comparable o falta un metadato usado anteriormente, no se omite automáticamente la lectura.

Actualizar el inventario no altera la fecha ni la huella de la última lectura. **Solicitar relectura** obliga a revisar un archivo aunque siga igual. Al registrar manualmente, marca «Confirmo que acabo de leer…» solo después de revisar todo el contenido; sin esa confirmación se mantiene la versión procesada anterior.

`analysis.coverage.read` cuenta contenidos leídos en la revisión actual y `reused` los reutilizados tras comparar metadatos. Si aceptas un registro de lectura pero descartas cambios de contenido de esa revisión, las nuevas lecturas se marcan para revisar antes de reutilizarlas, evitando ocultar resultados que no quedaron aceptados.

Los JSON anteriores siguen siendo compatibles: empiezan sin inventario y lo incorporan en su siguiente revisión o edición. Un documento antiguo marcado «Leído» no recibe automáticamente una fecha ni una huella inventadas. Los registros omitidos por una respuesta de IA permanecen guardados.

La comparación depende de los metadatos que el chat realmente pueda obtener de Drive. El dashboard evalúa el inventario guardado y no consulta Drive directamente. Las fechas y los resultados de procesamiento son declarados por quien revisa los archivos.

## Checklist y fuentes

Los 145 controles se transcribieron de las secciones 1 a 10 de `assets/Requerimientos_minimos_CCM_VDF.pdf`. Se agrupan en cinco pilares para el dashboard. Los criterios de oferta de la página 22 sustentan la identificación de controles críticos; se conservan los requisitos específicos de cada tecnología hasta que se justifique su no aplicación.

| Estado | Uso |
| --- | --- |
| Sin revisar | Todavía no se ha verificado el requisito. |
| Disponible | Tiene valor y al menos una evidencia con archivo, ubicación y extracto. |
| Falta | Se revisaron los antecedentes identificados y el dato no se encontró. |
| Parcial | Se encontró información incompleta. |
| Contradicción | Las fuentes discrepan; registra ambas referencias. |
| No aplica | Requiere una justificación y se excluye del porcentaje de avance. |

Cada evidencia admite nombre del archivo/correo, ruta y subcarpeta, revisión, página/sección/hoja/celdas, extracto y enlace. «Fuentes» en la tabla abre sus detalles. La referencia a la guía (`requirementSource`) indica el origen del **requisito**; `evidence` indica dónde se encontró la **información del proyecto**.

El avance es controles disponibles / controles aplicables. Los críticos pendientes incluyen los que aún no se han revisado. La condición de oferta se establece con criterio técnico/comercial; el sistema impide guardar una oferta firme mientras existan críticos pendientes. No se deduce automáticamente del porcentaje de avance.

## Documentos, consultas, equipo e historial

- **Documentos / revisiones:** cada revisión tiene su registro y su ID. `familyId` agrupa las revisiones de un documento. Registra comparaciones 0→1, 1→2, etc., con cambios observados, impacto, evidencia y justificación documentada, inferida o no encontrada. La revisión del documento es distinta de la versión del JSON.
- **Consultas:** filtros abiertas/cerradas/todas, responsable, control relacionado y seguimientos. Cerrar exige una resolución; reabrir conserva los mensajes y la resolución anterior en el historial.
- **Equipo:** nombre, cargo, empresa, teléfono, correo y observaciones de origen. «Proveedores» dirige a estos contactos del proyecto.
- **Historial:** decisiones manuales y cambios con autor, fecha, motivo y valores anterior/nuevo. Cada revisión de IA conserva también las diferencias aceptadas y descartadas.

El historial ofrece trazabilidad operativa dentro del JSON; no es una firma digital ni una bitácora inalterable frente a edición externa del archivo. Esta versión está pensada para trabajo local de una persona. Detecta versiones distintas entre pestañas y modificaciones externas, pero no sustituye un servidor de colaboración simultánea.

## Días hábiles y cierre

Se cuenta **desde el día siguiente al ingreso**, hasta la fecha de consulta o cierre inclusive. Se excluyen sábados, domingos y feriados registrados, usando fechas del calendario de Chile. Por ejemplo: ingreso 17/09/2026, cierre 21/09/2026 → **1 día hábil**.

Incluye feriados nacionales 2025 y 2026, con fuentes de [Gob.cl 2025](https://www.gob.cl/noticias/calendario-feriados-2025-festivos-irrenunciables-legales/) y [Gob.cl 2026](https://www.gob.cl/noticias/feriados-2026-revisa-cuantos-habra-y-cuales-son-irrenunciables/). En **Resumen → Feriados de Chile** puedes añadir o quitar fechas con justificación y registrar feriados regionales, comunales o internos que apliquen al proyecto. Los cambios de calendario quedan en su historial.

Los años sin verificar producen un conteo provisional, marcado con `*`. Antes de cerrar, completa sus feriados y registra la fuente en «Verificar o completar el año». No se presumen completos años futuros sin revisar.

**Cerrar propuesta** solicita fecha real, resultado y motivo. Guarda la duración calculada y una copia del calendario, deja el proyecto en «Cerrados» y exporta su JSON. Los días quedan congelados. Las consultas mantienen sus estados; el cierre no inventa resoluciones. Para editar nuevamente, reabre el proyecto con un motivo: el cierre anterior permanece en el historial.

El JSON conserva todos los registros y referencias de la propuesta, **no los binarios de los documentos**. Para archivar toda la propuesta, conserva también su carpeta original de archivos.

## Archivos de la base

| Archivo | Función |
| --- | --- |
| `index.html`, `styles.css` | Estructura, estilos y adaptación móvil. |
| `app.js`, `forms.js`, `events.js` | Vistas, formularios e interacciones. |
| `catalog.js` | Catálogo de los 145 controles, IDs y páginas de la guía. |
| `calendar.js` | Calendario inicial; cada proyecto recibe una copia. |
| `file-tracking.js` | Inventario de Drive, versión procesada y comparación para revisión incremental. |
| `model.js` | Validaciones, evidencia, historial, revisión y días hábiles. |
| `storage.js` | Persistencia por proyecto, archivos e importación/exportación. |
| `tools/project-pipeline.js`, `GEMINI.md` | Preparación, aplicación automática e instrucciones del agente local. |
| `review-prompt.js` | Instrucciones que se copian al chat externo. |
| `schema/project.schema.json` | Contrato estructural del JSON; las reglas cruzadas adicionales están en `model.js`. |
| `data/plantilla-proyecto.json` | Plantilla sin datos del negocio, para inspección. Crea proyectos desde la interfaz para obtener IDs nuevos. |
| `assets/` | Imágenes de referencia y PDF de requisitos. |

Los JSON de proyectos reales se almacenan en la carpeta que elijas, no en `data/`. Las fotografías de la interfaz son referenciales y pueden reemplazarse por recursos corporativos.

## Validación

La interfaz no necesita Node; el auxiliar del agente y las pruebas sí. Para verificar modelo, almacenamiento y pipeline:

```text
node --test tests/model.test.js tests/file-tracking.test.js tests/pipeline.test.js
```

Para las pruebas de interfaz, sirve esta carpeta por `localhost` y abre `tests/browser.html` **en un perfil temporal vacío**. Genera datos exclusivamente de prueba y usa el almacenamiento de archivos aislado del navegador para verificar las escrituras; la selección interactiva de una carpeta del equipo se reemplaza solo dentro de la prueba. `tests/responsive.html` inspecciona la interfaz a 390 px.

También puedes ejecutar `node tests/run-browser.js http://127.0.0.1:4173` con el servidor estático iniciado, Node 22 o posterior y Chrome instalado. El ejecutor crea su propio perfil temporal y cierra ese navegador al terminar. Usa `CHROME_PATH` si Chrome está en otra ubicación.

No guardes información real en el perfil de pruebas. No hay paquetes externos que instalar para esta base. El pipeline usa Node; el agente y su acceso a Drive se configuran por separado.
#   M D b o a r d  
 