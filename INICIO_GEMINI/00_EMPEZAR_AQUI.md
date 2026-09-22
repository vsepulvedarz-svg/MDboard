# Empezar con el pipeline de proyectos

El flujo implementado es **crear proyecto → JSON automático → pedir revisión al agente → JSON actualizado → recarga automática del dashboard**. En este modo no necesitas exportar ni importar archivos en cada revisión.

La aplicación sigue usando HTML, CSS y JavaScript. El agente ejecuta un comando auxiliar escrito en JavaScript nativo mediante Node.js 22 o posterior, sin paquetes adicionales. No hay servidor de aplicación ni API de IA integrada.

## Preparación inicial

1. Abre `D:\DashboardMichelle\index.html` en Chrome o Edge, o sirve la carpeta desde localhost. En **Carpeta de proyectos** elige **`D:\DashboardMichelle\projects`** y permite leer y escribir. Al crear el primer proyecto también se solicita elegir carpeta si todavía no hay una.
2. En **Nuevo proyecto** completa nombre, cliente, fecha de ingreso y URL de la carpeta de antecedentes de Drive. Se guarda `prj_ID.json` con 145 controles sin revisar, sin información ni evidencias inventadas.
3. Prepara **Gemini CLI u otro agente con acceso a los archivos locales y capacidad de ejecutar Node.js**. Inícialo en `D:\DashboardMichelle`. El archivo `GEMINI.md` contiene el procedimiento; Gemini CLI puede cargarlo como contexto del proyecto ([documentación oficial](https://geminicli.com/docs/cli/gemini-md/)).
4. Facilita al agente acceso a los antecedentes mediante una conexión autorizada a Drive o una carpeta local sincronizada. Si usas sincronización, indica la ruta local que corresponde a la URL registrada. El agente debe poder inventariar subcarpetas y leer los formatos utilizados. El pipeline no instala conectores ni convierte por sí solo DOCX, XLSX, PDF o correos.

La instalación y autorización de Gemini/Drive dependen de tu entorno y no se han realizado desde este proyecto. Node está disponible en el equipo utilizado para las pruebas; Gemini CLI no se encontró instalado en ese entorno.

La aplicación intenta recordar la carpeta y reconectarla cuando el permiso sigue vigente. Si el navegador solicita acceso otra vez, vuelve a vincularla. Sin carpeta vinculada los cambios solo quedan en el navegador. **Guardar todos** copia a la carpeta los proyectos que ya existían allí.

## Qué decirle al agente

```text
El dashboard está en D:\DashboardMichelle.
Lee GEMINI.md y actualiza el proyecto "NOMBRE DEL PROYECTO" de projects.
Usa el pipeline definido allí. La URL de antecedentes está en su JSON.
Inventaría las subcarpetas y lee documentos nuevos, modificados o pendientes.
Conserva fuentes, archivos procesados, revisiones y ajustes manuales.
Aplica el resultado y dime qué cambió y qué no pudiste revisar.
```

En la ficha, **Revisión con IA → Copiar mensaje para el agente** prepara este pedido con nombre, ID y URL. Ajusta las rutas si moviste la aplicación o usas otra carpeta de JSON.

Al día siguiente basta pedir **«Actualiza nuevamente el proyecto X»** en ese entorno. El agente prepara una base nueva y usa el inventario acumulado. Debe listar los metadatos otra vez para detectar novedades; el ahorro está en no abrir el contenido de archivos que se verificaron sin cambios.

## Qué sucede en cada revisión

- `prepare` guarda base e instrucciones y bloquea las ediciones del proyecto.
- El agente consulta documentos y escribe una respuesta separada.
- `apply` valida contra la versión base, aplica los cambios permitidos, incrementa la versión y conserva diferencias e historial en el JSON padre.
- Se preservan controles protegidos, contactos/documentos editados manualmente, identidad, fechas y consultas existentes. La IA puede añadir consultas abiertas. Una relectura solicitada manualmente sí puede completarse en el inventario cuando se registra una nueva lectura.
- La aplicación automática queda identificada como tal, sin aprobación humana ficticia. El historial incluye propuestas aplicadas y preservadas.
- El dashboard comprueba la carpeta cada 5 segundos mientras está visible y al volver a la ventana. Adopta versiones posteriores con historial continuo; un JSON inválido, duplicado o de otra rama produce un aviso.

Un resultado «sin cambios» también registra fecha y cobertura. Conserva la fecha original de lectura de archivos reutilizados. No se borran archivos históricos cuando dejan de aparecer o no se tiene acceso.

En la primera revisión real, comprueba una evidencia contra el documento original y confirma el alcance que pudo leer el agente. Las pruebas locales verifican guardado, validación y recarga; no acreditan acceso a tu Drive ni precisión de extracción de tus documentos.

## Organización

```text
D:\DashboardMichelle\
  GEMINI.md                      Instrucciones de entrada
  index.html, *.js, styles.css    Dashboard
  tools/project-pipeline.js      Preparar / validar / aplicar
  projects/
    prj_ID.json                  Un JSON padre por proyecto
    .pipeline/run_ID/            Base, instrucciones y respuesta de cada revisión
  data/plantilla-proyecto.json   Referencia vacía; no duplicar su ID
  schema/project.schema.json    Contrato
```

Los antecedentes permanecen en la carpeta de Drive indicada en cada proyecto. No mezcles plantillas o respuestas de revisión en la raíz de `projects`. Para otra carpeta de JSON, indica la ruta al agente para que use `--dir` en todos los comandos.

Las carpetas `.pipeline/` conservan bases de recuperación y pueden ocupar espacio. El JSON padre contiene por sí solo los datos y la trazabilidad; no incorpora los binarios de los documentos.

## Si se interrumpe una revisión

El agente puede ejecutar `node tools/project-pipeline.js status` para ver el run pendiente y retomarlo. Si ese agente ya no está trabajando, puede cancelar con `node tools/project-pipeline.js abort "run_ID"`: libera el bloqueo y conserva el padre. No borres un bloqueo durante una revisión.

El trabajo es secuencial y local. No uses dos equipos o agentes para actualizar el mismo proyecto simultáneamente: la sincronización de Drive no ofrece un bloqueo distribuido para este pipeline.

## Si usas Gemini en la web

Dar al chat web la ruta `D:\DashboardMichelle` no establece por sí solo un canal para editar esa carpeta local. Este pipeline requiere un agente con acceso al sistema de archivos ([herramientas de Gemini CLI](https://geminicli.com/docs/tools/file-system/)).

Se conserva una alternativa en **Revisión con IA → Si trabajas desde un chat web → Exportar / importar con revisión manual**. Exporta la revisión, adjunta ese JSON y las instrucciones generadas, entrega los antecedentes y luego importa la respuesta para elegir diferencias. No escribas una respuesta web directamente sobre el JSON padre.

Los archivos `02_...`, `03_...` y `05_...` de este paquete son referencias de plantilla, contrato y requisitos. `01_INSTRUCCIONES_GEMINI.md` es la entrada para el agente y `04_MENSAJES_PARA_COPIAR.txt` contiene los mensajes.
