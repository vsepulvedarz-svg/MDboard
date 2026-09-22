# JSON de proyectos

Vincula esta carpeta con «Carpeta de proyectos» en el dashboard. Cada proyecto
nuevo se guarda automáticamente aquí como `prj_ID.json`.

En esta raíz guarda solo JSON padre. Las revisiones temporales y bases de
recuperación se conservan en `.pipeline/`; el agente las gestiona mediante
`tools/project-pipeline.js`. No copies la plantilla como un proyecto real.

Un archivo `.lock` indica una revisión en curso: no lo elimines durante la
revisión. Para recuperarte de una sesión interrumpida usa `status` y retoma el
run, o `abort RUN_ID` después de confirmar que ese agente ya no está trabajando.
