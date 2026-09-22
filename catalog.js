/* Catálogo transcrito del PDF proporcionado. La guía define requisitos, no evidencia del proyecto. */
var CCM_CATALOG = {
  "version": "1.0",
  "source": {
    "file": "Requerimientos_minimos_CCM_VDF.pdf",
    "title": "Requerimientos mínimos para cotizar CCM y VDF",
    "pages": 23
  },
  "pillars": [
    {
      "id": 1,
      "title": "Información comercial",
      "icon": "document"
    },
    {
      "id": 2,
      "title": "Documentación de entrada",
      "icon": "settings"
    },
    {
      "id": 3,
      "title": "Datos técnicos y configuración",
      "icon": "database"
    },
    {
      "id": 4,
      "title": "Alcance y consultas",
      "icon": "chat"
    },
    {
      "id": 5,
      "title": "Condición de oferta y revisión",
      "icon": "project"
    }
  ],
  "sections": {
    "1": "Antecedentes comerciales",
    "2": "Documentación mínima de entrada",
    "3": "Datos comunes para CCM de baja tensión",
    "4": "CENTERLINE 2100",
    "5": "FLEXLINE 3500",
    "6": "Cargas y unidades funcionales",
    "7": "Ampliaciones de CCM existentes",
    "8": "Variadores de frecuencia",
    "9": "Ingeniería, servicios y documentación",
    "10": "Revisión antes de emitir la propuesta"
  },
  "requirements": [
    {
      "id": "r1-01",
      "section": 1,
      "page": 2,
      "label": "ID CRM o número de negocio",
      "criterion": "Debe existir una identificación única para controlar versiones, descuentos y seguimiento.",
      "pillar": 1,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 2,
        "section": 1
      }
    },
    {
      "id": "r1-02",
      "section": 1,
      "page": 2,
      "label": "Cliente y cliente final",
      "criterion": "Distinguir al comprador directo del usuario final y de la ingeniería o EPC involucrada.",
      "pillar": 1,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 2,
        "section": 1
      }
    },
    {
      "id": "r1-03",
      "section": 1,
      "page": 2,
      "label": "Nombre del proyecto",
      "criterion": "Utilizar el nombre oficial y el número de licitación cuando exista.",
      "pillar": 1,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 2,
        "section": 1
      }
    },
    {
      "id": "r1-04",
      "section": 1,
      "page": 2,
      "label": "Responsable comercial",
      "criterion": "Definir quién centraliza las comunicaciones con el cliente.",
      "pillar": 1,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 2,
        "section": 1
      }
    },
    {
      "id": "r1-05",
      "section": 1,
      "page": 2,
      "label": "Fecha de ingreso",
      "criterion": "Registrar cuándo se recibió el requerimiento.",
      "pillar": 1,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 2,
        "section": 1
      }
    },
    {
      "id": "r1-06",
      "section": 1,
      "page": 2,
      "label": "Fecha de cierre",
      "criterion": "Confirmar la fecha y hora límite del portal o del envío.",
      "pillar": 1,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 2,
        "section": 1
      }
    },
    {
      "id": "r1-07",
      "section": 1,
      "page": 2,
      "label": "Entrega requerida",
      "criterion": "Registrar la fecha solicitada por el cliente y contrastarla con el plazo real del fabricante.",
      "pillar": 1,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 2,
        "section": 1
      }
    },
    {
      "id": "r1-08",
      "section": 1,
      "page": 2,
      "label": "Tipo de propuesta",
      "criterion": "Definir expresamente si es firme o referencial.",
      "pillar": 1,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 2,
        "section": 1
      }
    },
    {
      "id": "r1-09",
      "section": 1,
      "page": 2,
      "label": "Competencia",
      "criterion": "Identificar marcas y tecnologías contra las cuales se compite.",
      "pillar": 1,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 2,
        "section": 1
      }
    },
    {
      "id": "r1-10",
      "section": 1,
      "page": 2,
      "label": "Target o presupuesto",
      "criterion": "Registrar el objetivo económico cuando esté disponible.",
      "pillar": 1,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 2,
        "section": 1
      }
    },
    {
      "id": "r1-11",
      "section": 1,
      "page": 3,
      "label": "Driver del negocio",
      "criterion": "Indicar si el criterio principal es precio, plazo, tecnología, continuidad de base instalada o especificación de marca.",
      "pillar": 1,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 3,
        "section": 1
      }
    },
    {
      "id": "r1-12",
      "section": 1,
      "page": 3,
      "label": "Probabilidad y fecha de compra",
      "criterion": "Registrar compromiso o expectativa de adjudicación y su fecha estimada.",
      "pillar": 1,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 3,
        "section": 1
      }
    },
    {
      "id": "r2-01",
      "section": 2,
      "page": 3,
      "label": "Diagrama unilineal",
      "criterion": "Debe mostrar acometidas, barras, alimentadores, cargas y arquitectura general.",
      "pillar": 2,
      "critical": true,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 3,
        "section": 2
      }
    },
    {
      "id": "r2-02",
      "section": 2,
      "page": 3,
      "label": "Listado de cargas o TAG",
      "criterion": "Debe identificar cantidad, potencia o corriente y tipo de unidad requerida.",
      "pillar": 2,
      "critical": true,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 3,
        "section": 2
      }
    },
    {
      "id": "r2-03",
      "section": 2,
      "page": 3,
      "label": "Especificaciones técnicas",
      "criterion": "Revisar normas, construcción, pruebas, materiales y desviaciones permitidas.",
      "pillar": 2,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 3,
        "section": 2
      }
    },
    {
      "id": "r2-04",
      "section": 2,
      "page": 3,
      "label": "Hoja de datos",
      "criterion": "Completar y contrastar cada dato con el reporte técnico o la propuesta.",
      "pillar": 2,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 3,
        "section": 2
      }
    },
    {
      "id": "r2-05",
      "section": 2,
      "page": 3,
      "label": "Layout o elevación",
      "criterion": "Revisar restricciones dimensionales, acceso y disposición solicitada.",
      "pillar": 2,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 3,
        "section": 2
      }
    },
    {
      "id": "r2-06",
      "section": 2,
      "page": 3,
      "label": "Arquitectura de control",
      "criterion": "Revisar PLC, DCS, redes, señales cableadas y protocolos.",
      "pillar": 2,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 3,
        "section": 2
      }
    },
    {
      "id": "r2-07",
      "section": 2,
      "page": 3,
      "label": "Formato de oferta",
      "criterion": "Confirmar formatos obligatorios, planillas, cuadros de precios y portal de carga.",
      "pillar": 2,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 3,
        "section": 2
      }
    },
    {
      "id": "r2-08",
      "section": 2,
      "page": 3,
      "label": "Lista de entregables",
      "criterion": "Identificar planos, manuales, hojas de datos, certificados y dossiers requeridos.",
      "pillar": 2,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 3,
        "section": 2
      }
    },
    {
      "id": "r3-01",
      "section": 3,
      "page": 4,
      "label": "Tensión nominal",
      "criterion": "Tensión de potencia del CCM y de las cargas.",
      "pillar": 3,
      "critical": true,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 4,
        "section": 3
      }
    },
    {
      "id": "r3-02",
      "section": 3,
      "page": 4,
      "label": "Frecuencia",
      "criterion": "Confirmar 50 o 60 Hz.",
      "pillar": 3,
      "critical": true,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 4,
        "section": 3
      }
    },
    {
      "id": "r3-03",
      "section": 3,
      "page": 4,
      "label": "Fases y neutro",
      "criterion": "Confirmar sistema trifásico y necesidad de neutro.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 4,
        "section": 3
      }
    },
    {
      "id": "r3-04",
      "section": 3,
      "page": 4,
      "label": "Cortocircuito",
      "criterion": "Corriente de cortocircuito requerida en el punto de instalación y duración cuando corresponda.",
      "pillar": 3,
      "critical": true,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 4,
        "section": 3
      }
    },
    {
      "id": "r3-05",
      "section": 3,
      "page": 4,
      "label": "Tensión de control",
      "criterion": "Definir tensión y fuente de control interna o externa.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 4,
        "section": 3
      }
    },
    {
      "id": "r3-06",
      "section": 3,
      "page": 4,
      "label": "Fuente del sistema",
      "criterion": "Cuando afecte el dimensionamiento, registrar transformador, potencia e impedancia disponibles.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 4,
        "section": 3
      }
    },
    {
      "id": "r3-07",
      "section": 3,
      "page": 4,
      "label": "Corriente de barra principal",
      "criterion": "Debe cubrir la demanda y la arquitectura definida por el unilineal.",
      "pillar": 3,
      "critical": true,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 4,
        "section": 3
      }
    },
    {
      "id": "r3-08",
      "section": 3,
      "page": 4,
      "label": "Barras verticales",
      "criterion": "Revisar capacidad estándar del fabricante y requerimientos del cliente.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 4,
        "section": 3
      }
    },
    {
      "id": "r3-09",
      "section": 3,
      "page": 5,
      "label": "Número de conductores",
      "criterion": "Confirmar tres conductores o sistema con neutro.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 5,
        "section": 3
      }
    },
    {
      "id": "r3-10",
      "section": 3,
      "page": 5,
      "label": "Configuración de acometida",
      "criterion": "Incoming simple, doble incoming o Main Tie Main con bus coupler.",
      "pillar": 3,
      "critical": true,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 5,
        "section": 3
      }
    },
    {
      "id": "r3-11",
      "section": 3,
      "page": 5,
      "label": "Operación del acoplador",
      "criterion": "Manual o automática, con ATS o lógica de transferencia cuando aplique.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 5,
        "section": 3
      }
    },
    {
      "id": "r3-12",
      "section": 3,
      "page": 5,
      "label": "Paralelismo",
      "criterion": "Confirmar si se permite paralelismo momentáneo de fuentes.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 5,
        "section": 3
      }
    },
    {
      "id": "r3-13",
      "section": 3,
      "page": 5,
      "label": "Reserva futura",
      "criterion": "Registrar porcentaje de espacio futuro, puertas, cubículos o unidades equipadas.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 5,
        "section": 3
      }
    },
    {
      "id": "r3-14",
      "section": 3,
      "page": 5,
      "label": "Entrada y salida de cables",
      "criterion": "Superior o inferior, de acuerdo con layout y disposición de planta.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 5,
        "section": 3
      }
    },
    {
      "id": "r3-15",
      "section": 3,
      "page": 5,
      "label": "Dentro o fuera de sala",
      "criterion": "Dato básico para definir la solución de construcción.",
      "pillar": 3,
      "critical": true,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 5,
        "section": 3
      }
    },
    {
      "id": "r3-16",
      "section": 3,
      "page": 5,
      "label": "Altitud",
      "criterion": "Registrar metros sobre el nivel del mar; puede afectar barras, interruptores, VDF y ventilación.",
      "pillar": 3,
      "critical": true,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 5,
        "section": 3
      }
    },
    {
      "id": "r3-17",
      "section": 3,
      "page": 5,
      "label": "Temperatura ambiente",
      "criterion": "Registrar mínimos y máximos de diseño.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 5,
        "section": 3
      }
    },
    {
      "id": "r3-18",
      "section": 3,
      "page": 5,
      "label": "Ambiente",
      "criterion": "Identificar polvo, humedad, ambiente salino, gases corrosivos o vibración.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 5,
        "section": 3
      }
    },
    {
      "id": "r3-19",
      "section": 3,
      "page": 6,
      "label": "Acceso",
      "criterion": "Confirmar acceso frontal o necesidad de acceso posterior.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 6,
        "section": 3
      }
    },
    {
      "id": "r3-20",
      "section": 3,
      "page": 6,
      "label": "Restricciones",
      "criterion": "Registrar dimensiones máximas, rutas de ingreso, izaje y separación disponible.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 6,
        "section": 3
      }
    },
    {
      "id": "r4-01",
      "section": 4,
      "page": 6,
      "label": "Construcción NEMA",
      "criterion": "Confirmar que la especificación y la aplicación permiten CENTERLINE 2100.",
      "pillar": 3,
      "critical": true,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 6,
        "section": 4
      }
    },
    {
      "id": "r4-02",
      "section": 4,
      "page": 6,
      "label": "Instalación",
      "criterion": "Dentro o fuera de sala; no solicitar al cliente un grado NEMA como dato básico.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 6,
        "section": 4
      }
    },
    {
      "id": "r4-03",
      "section": 4,
      "page": 6,
      "label": "ANSI 49",
      "criterion": "Considerar como pintura estándar e informarla en la propuesta.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 6,
        "section": 4
      }
    },
    {
      "id": "r4-04",
      "section": 4,
      "page": 6,
      "label": "ArcShield",
      "criterion": "Confirmar si se requiere resistencia al arco y bajo qué condición de acceso u operación.",
      "pillar": 3,
      "critical": true,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 6,
        "section": 4
      }
    },
    {
      "id": "r4-05",
      "section": 4,
      "page": 6,
      "label": "Configuración del incoming",
      "criterion": "Verificar que la alternativa seleccionada mantenga la certificación declarada. Un Incoming Lug puede afectar la condición ArcShield.",
      "pillar": 3,
      "critical": true,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 6,
        "section": 4
      }
    },
    {
      "id": "r4-06",
      "section": 4,
      "page": 6,
      "label": "Unidades",
      "criterion": "Confirmar unidades fijas, removibles o plug in según el alcance.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 6,
        "section": 4
      }
    },
    {
      "id": "r4-07",
      "section": 4,
      "page": 7,
      "label": "Space Factor",
      "criterion": "Definir el espacio requerido por cada gaveta y la disponibilidad en el lineup.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 7,
        "section": 4
      }
    },
    {
      "id": "r4-08",
      "section": 4,
      "page": 7,
      "label": "Shutters",
      "criterion": "Confirmar requerimiento de shutters automáticos cuando aplique.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 7,
        "section": 4
      }
    },
    {
      "id": "r4-09",
      "section": 4,
      "page": 7,
      "label": "Controlador de motor",
      "criterion": "Definir relé térmico, electrónico o inteligente y protocolo de comunicación.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 7,
        "section": 4
      }
    },
    {
      "id": "r4-10",
      "section": 4,
      "page": 7,
      "label": "Medición",
      "criterion": "Definir medidores, variables y accesorios solicitados.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 7,
        "section": 4
      }
    },
    {
      "id": "r4-11",
      "section": 4,
      "page": 7,
      "label": "Protecciones especiales",
      "criterion": "Falla a tierra, 50G, diferencial u otras funciones requeridas.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 7,
        "section": 4
      }
    },
    {
      "id": "r4-12",
      "section": 4,
      "page": 7,
      "label": "Comunicaciones",
      "criterion": "Confirmar protocolo y arquitectura de red compatible con la solución.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 7,
        "section": 4
      }
    },
    {
      "id": "r4-13",
      "section": 4,
      "page": 7,
      "label": "Reserva",
      "criterion": "Registrar cubículos futuros, espacios libres o unidades preparadas.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 7,
        "section": 4
      }
    },
    {
      "id": "r5-01",
      "section": 5,
      "page": 8,
      "label": "Construcción IEC",
      "criterion": "Confirmar que la especificación exige o permite FLEXLINE 3500.",
      "pillar": 3,
      "critical": true,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 8,
        "section": 5
      }
    },
    {
      "id": "r5-02",
      "section": 5,
      "page": 8,
      "label": "Instalación",
      "criterion": "Confirmar dentro o fuera de sala y las condiciones ambientales.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 8,
        "section": 5
      }
    },
    {
      "id": "r5-03",
      "section": 5,
      "page": 8,
      "label": "Segregación",
      "criterion": "Revisar la forma requerida en la especificación, por ejemplo Form 4B cuando corresponda.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 8,
        "section": 5
      }
    },
    {
      "id": "r5-04",
      "section": 5,
      "page": 8,
      "label": "Tipo de unidades",
      "criterion": "Fijas, removibles o withdrawable según el requerimiento.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 8,
        "section": 5
      }
    },
    {
      "id": "r5-05",
      "section": 5,
      "page": 8,
      "label": "Acometidas",
      "criterion": "Definir incoming simple, doble incoming y bus coupler.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 8,
        "section": 5
      }
    },
    {
      "id": "r5-06",
      "section": 5,
      "page": 8,
      "label": "Main Tie Main",
      "criterion": "Confirmar operación, enclavamientos, ATS y tipo de interruptores.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 8,
        "section": 5
      }
    },
    {
      "id": "r5-07",
      "section": 5,
      "page": 8,
      "label": "Barras",
      "criterion": "Definir corriente, número de conductores y secciones de barra.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 8,
        "section": 5
      }
    },
    {
      "id": "r5-08",
      "section": 5,
      "page": 9,
      "label": "Cableado",
      "criterion": "Ingreso y salida superior o inferior y espacio de cables.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 9,
        "section": 5
      }
    },
    {
      "id": "r5-09",
      "section": 5,
      "page": 9,
      "label": "Control de motores",
      "criterion": "Definir FVNR, FVR, protecciones, UMC u otro controlador.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 9,
        "section": 5
      }
    },
    {
      "id": "r5-10",
      "section": 5,
      "page": 9,
      "label": "Comunicaciones",
      "criterion": "Confirmar protocolo, red e integración con PLC o DCS.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 9,
        "section": 5
      }
    },
    {
      "id": "r5-11",
      "section": 5,
      "page": 9,
      "label": "Acceso",
      "criterion": "Confirmar requerimientos frontales, posteriores y mantenimiento.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 9,
        "section": 5
      }
    },
    {
      "id": "r5-12",
      "section": 5,
      "page": 9,
      "label": "Jefe de proyecto",
      "criterion": "Considerar desde el inicio cuando la solución requiera coordinación de ingeniería e integración.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 9,
        "section": 5
      }
    },
    {
      "id": "r6-01",
      "section": 6,
      "page": 10,
      "label": "TAG",
      "criterion": "Identificación única de la carga o alimentador.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 10,
        "section": 6
      }
    },
    {
      "id": "r6-02",
      "section": 6,
      "page": 10,
      "label": "Cantidad",
      "criterion": "Número total de unidades iguales.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 10,
        "section": 6
      }
    },
    {
      "id": "r6-03",
      "section": 6,
      "page": 10,
      "label": "Tipo de carga",
      "criterion": "Motor, alimentador, calefactor, transformador u otra carga.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 10,
        "section": 6
      }
    },
    {
      "id": "r6-04",
      "section": 6,
      "page": 10,
      "label": "Tipo de unidad",
      "criterion": "FVNR, FVR, feeder, soft starter, VDF u otra.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 10,
        "section": 6
      }
    },
    {
      "id": "r6-05",
      "section": 6,
      "page": 10,
      "label": "Potencia",
      "criterion": "HP o kW del motor o carga.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 10,
        "section": 6
      }
    },
    {
      "id": "r6-06",
      "section": 6,
      "page": 10,
      "label": "Corriente",
      "criterion": "Corriente nominal disponible o calculada.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 10,
        "section": 6
      }
    },
    {
      "id": "r6-07",
      "section": 6,
      "page": 10,
      "label": "Protección",
      "criterion": "Breaker, fusibles, relé y capacidad interruptiva.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 10,
        "section": 6
      }
    },
    {
      "id": "r6-08",
      "section": 6,
      "page": 10,
      "label": "Controlador",
      "criterion": "E300, UMC100.3 u otra alternativa requerida.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 10,
        "section": 6
      }
    },
    {
      "id": "r6-09",
      "section": 6,
      "page": 10,
      "label": "Comunicación",
      "criterion": "EtherNet IP, Profibus DP, Modbus TCP u otro protocolo definido.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 10,
        "section": 6
      }
    },
    {
      "id": "r6-10",
      "section": 6,
      "page": 10,
      "label": "Señales",
      "criterion": "Marcha, falla, local remoto, abierto cerrado, analógicas y contactos auxiliares.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 10,
        "section": 6
      }
    },
    {
      "id": "r6-11",
      "section": 6,
      "page": 11,
      "label": "Accesorios",
      "criterion": "Botoneras, selectores, luces piloto, borneras, bobinas y accionamientos.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 11,
        "section": 6
      }
    },
    {
      "id": "r6-12",
      "section": 6,
      "page": 11,
      "label": "Protección especial",
      "criterion": "50G, falla a tierra, monitoreo diferencial u otras funciones.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 11,
        "section": 6
      }
    },
    {
      "id": "r6-13",
      "section": 6,
      "page": 11,
      "label": "Ubicación física",
      "criterion": "Columna, gaveta, Space Factor o posición requerida.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 11,
        "section": 6
      }
    },
    {
      "id": "r6-14",
      "section": 6,
      "page": 11,
      "label": "Reserva",
      "criterion": "Espacio futuro, gaveta equipada o solo puerta y cubículo.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 11,
        "section": 6
      }
    },
    {
      "id": "r7-01",
      "section": 7,
      "page": 12,
      "label": "Fabricante y modelo",
      "criterion": "Identificar exactamente el CCM existente.",
      "pillar": 3,
      "critical": true,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 12,
        "section": 7
      }
    },
    {
      "id": "r7-02",
      "section": 7,
      "page": 12,
      "label": "Número de serie y orden",
      "criterion": "Solicitar placa, serie y orden de fabricación cuando exista.",
      "pillar": 3,
      "critical": true,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 12,
        "section": 7
      }
    },
    {
      "id": "r7-03",
      "section": 7,
      "page": 12,
      "label": "Fotografías",
      "criterion": "Vistas generales, interiores, barras, gavetas y espacio disponible.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 12,
        "section": 7
      }
    },
    {
      "id": "r7-04",
      "section": 7,
      "page": 12,
      "label": "Planos originales",
      "criterion": "Unilineal, elevación frontal, layout y diagramas de control.",
      "pillar": 3,
      "critical": true,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 12,
        "section": 7
      }
    },
    {
      "id": "r7-05",
      "section": 7,
      "page": 12,
      "label": "Disponibilidad física",
      "criterion": "Confirmar espacios libres para columnas o gavetas.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 12,
        "section": 7
      }
    },
    {
      "id": "r7-06",
      "section": 7,
      "page": 12,
      "label": "Compatibilidad de barras",
      "criterion": "Corriente, cortocircuito, posición y unión con el lineup existente.",
      "pillar": 3,
      "critical": true,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 12,
        "section": 7
      }
    },
    {
      "id": "r7-07",
      "section": 7,
      "page": 12,
      "label": "Stabs y gavetas",
      "criterion": "Verificar Space Factor, conexión y compatibilidad mecánica y eléctrica.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 12,
        "section": 7
      }
    },
    {
      "id": "r7-08",
      "section": 7,
      "page": 13,
      "label": "Conductores",
      "criterion": "Revisar longitud disponible de fuerza, control y comunicación.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 13,
        "section": 7
      }
    },
    {
      "id": "r7-09",
      "section": 7,
      "page": 13,
      "label": "Red existente",
      "criterion": "Confirmar protocolo, nodos disponibles y arquitectura instalada.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 13,
        "section": 7
      }
    },
    {
      "id": "r7-10",
      "section": 7,
      "page": 13,
      "label": "Trabajo en terreno",
      "criterion": "Definir corte, perforación, modificaciones, pruebas y responsabilidad de montaje.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 13,
        "section": 7
      }
    },
    {
      "id": "r8-01",
      "section": 8,
      "page": 14,
      "label": "Potencia",
      "criterion": "HP o kW nominales.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 14,
        "section": 8
      }
    },
    {
      "id": "r8-02",
      "section": 8,
      "page": 14,
      "label": "Tensión",
      "criterion": "Tensión nominal del motor.",
      "pillar": 3,
      "critical": true,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 14,
        "section": 8
      }
    },
    {
      "id": "r8-03",
      "section": 8,
      "page": 14,
      "label": "Corriente de placa",
      "criterion": "Dato crítico para seleccionar el frame.",
      "pillar": 3,
      "critical": true,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 14,
        "section": 8
      }
    },
    {
      "id": "r8-04",
      "section": 8,
      "page": 14,
      "label": "Frecuencia",
      "criterion": "Frecuencia nominal.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 14,
        "section": 8
      }
    },
    {
      "id": "r8-05",
      "section": 8,
      "page": 14,
      "label": "Velocidad",
      "criterion": "RPM nominales y rango de velocidad requerido.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 14,
        "section": 8
      }
    },
    {
      "id": "r8-06",
      "section": 8,
      "page": 14,
      "label": "Tipo de motor",
      "criterion": "Inducción, imán permanente u otro.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 14,
        "section": 8
      }
    },
    {
      "id": "r8-07",
      "section": 8,
      "page": 14,
      "label": "Placa del motor",
      "criterion": "Solicitar fotografía o ficha técnica completa.",
      "pillar": 3,
      "critical": true,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 14,
        "section": 8
      }
    },
    {
      "id": "r8-08",
      "section": 8,
      "page": 14,
      "label": "Aptitud para VDF",
      "criterion": "Confirmar condición inverter duty, aislamiento y restricciones del motor.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 14,
        "section": 8
      }
    },
    {
      "id": "r8-09",
      "section": 8,
      "page": 15,
      "label": "Aplicación",
      "criterion": "Bomba, ventilador, correa, compresor, molino, grúa, mezclador u otra.",
      "pillar": 3,
      "critical": true,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 15,
        "section": 8
      }
    },
    {
      "id": "r8-10",
      "section": 8,
      "page": 15,
      "label": "Tipo de torque",
      "criterion": "Variable o constante.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 15,
        "section": 8
      }
    },
    {
      "id": "r8-11",
      "section": 8,
      "page": 15,
      "label": "Régimen",
      "criterion": "Normal Duty o Heavy Duty según carga y sobrecarga.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 15,
        "section": 8
      }
    },
    {
      "id": "r8-12",
      "section": 8,
      "page": 15,
      "label": "Sobrecarga",
      "criterion": "Corriente y tiempo de sobrecarga requeridos.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 15,
        "section": 8
      }
    },
    {
      "id": "r8-13",
      "section": 8,
      "page": 15,
      "label": "Aceleración",
      "criterion": "Tiempos de aceleración y desaceleración.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 15,
        "section": 8
      }
    },
    {
      "id": "r8-14",
      "section": 8,
      "page": 15,
      "label": "Partidas",
      "criterion": "Número de partidas por hora y operación continua o intermitente.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 15,
        "section": 8
      }
    },
    {
      "id": "r8-15",
      "section": 8,
      "page": 15,
      "label": "Frenado",
      "criterion": "Frenado resistivo, carga regenerativa o AFE cuando corresponda.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 15,
        "section": 8
      }
    },
    {
      "id": "r8-16",
      "section": 8,
      "page": 15,
      "label": "Bypass",
      "criterion": "Confirmar necesidad de bypass, transferencia o maestro seguidor.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 15,
        "section": 8
      }
    },
    {
      "id": "r8-17",
      "section": 8,
      "page": 16,
      "label": "Alimentación",
      "criterion": "Tensión, frecuencia y número de fases.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 16,
        "section": 8
      }
    },
    {
      "id": "r8-18",
      "section": 8,
      "page": 16,
      "label": "Cortocircuito",
      "criterion": "Corriente disponible en el punto de conexión.",
      "pillar": 3,
      "critical": true,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 16,
        "section": 8
      }
    },
    {
      "id": "r8-19",
      "section": 8,
      "page": 16,
      "label": "Transformador",
      "criterion": "Potencia e impedancia cuando afecten selección o armónicos.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 16,
        "section": 8
      }
    },
    {
      "id": "r8-20",
      "section": 8,
      "page": 16,
      "label": "Altitud",
      "criterion": "Metros sobre el nivel del mar.",
      "pillar": 3,
      "critical": true,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 16,
        "section": 8
      }
    },
    {
      "id": "r8-21",
      "section": 8,
      "page": 16,
      "label": "Temperatura",
      "criterion": "Temperatura ambiente mínima y máxima.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 16,
        "section": 8
      }
    },
    {
      "id": "r8-22",
      "section": 8,
      "page": 16,
      "label": "Interior o exterior",
      "criterion": "Condición de instalación y ambiente.",
      "pillar": 3,
      "critical": true,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 16,
        "section": 8
      }
    },
    {
      "id": "r8-23",
      "section": 8,
      "page": 16,
      "label": "Forma de suministro",
      "criterion": "VDF abierto, Drive in a Box, Package Drive, gabinete independiente o integración en CCM.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 16,
        "section": 8
      }
    },
    {
      "id": "r8-24",
      "section": 8,
      "page": 16,
      "label": "Distancia al motor",
      "criterion": "Longitud aproximada del cable VDF motor.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 16,
        "section": 8
      }
    },
    {
      "id": "r8-25",
      "section": 8,
      "page": 16,
      "label": "Filtro de salida",
      "criterion": "Evaluar reactor, DV DT o filtro sinusoidal según distancia y motor.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 16,
        "section": 8
      }
    },
    {
      "id": "r8-26",
      "section": 8,
      "page": 17,
      "label": "Armónicos",
      "criterion": "Confirmar límites, IEEE 519, filtros, solución Low Harmonic o AFE.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 17,
        "section": 8
      }
    },
    {
      "id": "r8-27",
      "section": 8,
      "page": 17,
      "label": "Comunicación",
      "criterion": "Protocolo, señales, HMI, STO, encoder y realimentación.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 17,
        "section": 8
      }
    },
    {
      "id": "r8-28",
      "section": 8,
      "page": 17,
      "label": "Ventilación",
      "criterion": "Definir refrigeración, redundancia y condiciones del gabinete.",
      "pillar": 3,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 17,
        "section": 8
      }
    },
    {
      "id": "r9-01",
      "section": 9,
      "page": 18,
      "label": "Ingeniería",
      "criterion": "Definir si se incluye ingeniería de detalle, revisión de documentos y planos para aprobación.",
      "pillar": 4,
      "critical": true,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 18,
        "section": 9
      }
    },
    {
      "id": "r9-02",
      "section": 9,
      "page": 18,
      "label": "Integración",
      "criterion": "Definir modificaciones, cableado, programación y pruebas internas.",
      "pillar": 4,
      "critical": true,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 18,
        "section": 9
      }
    },
    {
      "id": "r9-03",
      "section": 9,
      "page": 18,
      "label": "Planos",
      "criterion": "Elevación frontal, unilineal, esquemas de control, listas de materiales y conexiones.",
      "pillar": 4,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 18,
        "section": 9
      }
    },
    {
      "id": "r9-04",
      "section": 9,
      "page": 18,
      "label": "Hojas de datos",
      "criterion": "Confirmar formato y responsable de completar comentarios.",
      "pillar": 4,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 18,
        "section": 9
      }
    },
    {
      "id": "r9-05",
      "section": 9,
      "page": 18,
      "label": "FAT",
      "criterion": "Alcance de pruebas, testigos, protocolos y aviso previo requerido.",
      "pillar": 4,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 18,
        "section": 9
      }
    },
    {
      "id": "r9-06",
      "section": 9,
      "page": 18,
      "label": "Inspecciones",
      "criterion": "Registrar hitos y días de aviso exigidos.",
      "pillar": 4,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 18,
        "section": 9
      }
    },
    {
      "id": "r9-07",
      "section": 9,
      "page": 18,
      "label": "Transporte",
      "criterion": "Condición de entrega, embalaje, exportación y despacho parcial.",
      "pillar": 4,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 18,
        "section": 9
      }
    },
    {
      "id": "r9-08",
      "section": 9,
      "page": 19,
      "label": "Montaje",
      "criterion": "Definir si se incluye asistencia o montaje completo.",
      "pillar": 4,
      "critical": true,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 19,
        "section": 9
      }
    },
    {
      "id": "r9-09",
      "section": 9,
      "page": 19,
      "label": "Comisionamiento",
      "criterion": "Definir alcance, cantidad de días, jornadas y exclusiones.",
      "pillar": 4,
      "critical": true,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 19,
        "section": 9
      }
    },
    {
      "id": "r9-10",
      "section": 9,
      "page": 19,
      "label": "Puesta en marcha",
      "criterion": "Definir responsabilidades, recursos del cliente y condiciones previas.",
      "pillar": 4,
      "critical": true,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 19,
        "section": 9
      }
    },
    {
      "id": "r9-11",
      "section": 9,
      "page": 19,
      "label": "Capacitación",
      "criterion": "Cantidad de personas, duración, lugar y contenido.",
      "pillar": 4,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 19,
        "section": 9
      }
    },
    {
      "id": "r9-12",
      "section": 9,
      "page": 19,
      "label": "Repuestos",
      "criterion": "Repuestos para puesta en marcha, críticos y para uno o dos años.",
      "pillar": 4,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 19,
        "section": 9
      }
    },
    {
      "id": "r9-13",
      "section": 9,
      "page": 19,
      "label": "Garantía",
      "criterion": "Confirmar duración, inicio y condiciones.",
      "pillar": 4,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 19,
        "section": 9
      }
    },
    {
      "id": "r9-14",
      "section": 9,
      "page": 19,
      "label": "Documentación final",
      "criterion": "Manuales, certificados, dossier y formato de entrega.",
      "pillar": 4,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 19,
        "section": 9
      }
    },
    {
      "id": "r10-01",
      "section": 10,
      "page": 20,
      "label": "Configuración",
      "criterion": "Coincide con el unilineal, la lista de cargas y la hoja de datos.",
      "pillar": 5,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 20,
        "section": 10
      }
    },
    {
      "id": "r10-02",
      "section": 10,
      "page": 20,
      "label": "Cantidades",
      "criterion": "Se verificaron columnas, gavetas, unidades, accesorios y repuestos.",
      "pillar": 5,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 20,
        "section": 10
      }
    },
    {
      "id": "r10-03",
      "section": 10,
      "page": 20,
      "label": "Desviaciones",
      "criterion": "Se declararon todas las diferencias respecto de la especificación.",
      "pillar": 5,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 20,
        "section": 10
      }
    },
    {
      "id": "r10-04",
      "section": 10,
      "page": 20,
      "label": "Supuestos",
      "criterion": "Se identificaron los datos asumidos y su impacto.",
      "pillar": 5,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 20,
        "section": 10
      }
    },
    {
      "id": "r10-05",
      "section": 10,
      "page": 20,
      "label": "Precio",
      "criterion": "Incluye equipos, materiales, integración, servicios, transporte y contingencias aplicables.",
      "pillar": 5,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 20,
        "section": 10
      }
    },
    {
      "id": "r10-06",
      "section": 10,
      "page": 20,
      "label": "Descuento y margen",
      "criterion": "Se encuentran aprobados cuando corresponde.",
      "pillar": 5,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 20,
        "section": 10
      }
    },
    {
      "id": "r10-07",
      "section": 10,
      "page": 20,
      "label": "Plazo",
      "criterion": "Considera fabricación, procesamiento interno, transporte, calidad y entrega.",
      "pillar": 5,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 20,
        "section": 10
      }
    },
    {
      "id": "r10-08",
      "section": 10,
      "page": 21,
      "label": "Validez",
      "criterion": "Se indicó vigencia técnica y comercial de la propuesta.",
      "pillar": 5,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 21,
        "section": 10
      }
    },
    {
      "id": "r10-09",
      "section": 10,
      "page": 21,
      "label": "Condición de pago",
      "criterion": "Se revisó contra el requerimiento y los riesgos del negocio.",
      "pillar": 5,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 21,
        "section": 10
      }
    },
    {
      "id": "r10-10",
      "section": 10,
      "page": 21,
      "label": "Multas",
      "criterion": "Se identificaron, limitaron o declararon como desviación.",
      "pillar": 5,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 21,
        "section": 10
      }
    },
    {
      "id": "r10-11",
      "section": 10,
      "page": 21,
      "label": "Exclusiones",
      "criterion": "Se redactaron claramente y no contradicen el alcance ofertado.",
      "pillar": 5,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 21,
        "section": 10
      }
    },
    {
      "id": "r10-12",
      "section": 10,
      "page": 21,
      "label": "Entregables",
      "criterion": "Se verificó que todos los documentos comprometidos estén incluidos.",
      "pillar": 5,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 21,
        "section": 10
      }
    },
    {
      "id": "r10-13",
      "section": 10,
      "page": 21,
      "label": "Revisión interna",
      "criterion": "Ingeniería, comercial y responsables técnicos revisaron los puntos críticos.",
      "pillar": 5,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 21,
        "section": 10
      }
    },
    {
      "id": "r10-14",
      "section": 10,
      "page": 21,
      "label": "Formato de envío",
      "criterion": "Se respetaron portal, planillas, moneda, idioma y estructura solicitada.",
      "pillar": 5,
      "critical": false,
      "requirementSource": {
        "file": "Requerimientos_minimos_CCM_VDF.pdf",
        "page": 21,
        "section": 10
      }
    }
  ]
};
if (typeof module !== "undefined" && module.exports) module.exports = CCM_CATALOG;
