/* Fechas nacionales verificadas contra los calendarios publicados por Gob.cl.
 * Los feriados regionales/comunales o excepcionales se registran por proyecto.
 * Un año fuera de coverage NO se considera completo ni permite cerrar una propuesta.
 */
var CCM_CALENDAR = (() => {
  const source2025 = 'https://www.gob.cl/noticias/calendario-feriados-2025-festivos-irrenunciables-legales/';
  const source2026 = 'https://www.gob.cl/noticias/feriados-2026-revisa-cuantos-habra-y-cuales-son-irrenunciables/';
  const common = [
    ['01-01', 'Año Nuevo'], ['05-01', 'Día del Trabajo'], ['05-21', 'Glorias Navales'],
    ['07-16', 'Virgen del Carmen'], ['08-15', 'Asunción de la Virgen'],
    ['09-18', 'Independencia Nacional'], ['09-19', 'Glorias del Ejército'],
    ['10-12', 'Encuentro de Dos Mundos'], ['10-31', 'Iglesias Evangélicas y Protestantes'],
    ['11-01', 'Todos los Santos'], ['12-08', 'Inmaculada Concepción'], ['12-25', 'Navidad']
  ];
  const dates = {
    2025: [...common, ['04-18', 'Viernes Santo'], ['04-19', 'Sábado Santo'], ['06-20', 'Pueblos Indígenas'], ['06-29', 'San Pedro y San Pablo / primarias'], ['11-16', 'Elecciones presidenciales y parlamentarias'], ['12-14', 'Segunda vuelta presidencial']],
    2026: [...common, ['04-03', 'Viernes Santo'], ['04-04', 'Sábado Santo'], ['06-21', 'Pueblos Indígenas'], ['06-29', 'San Pedro y San Pablo']]
  };
  return {
    country: 'CL', timeZone: 'America/Santiago', countingRule: 'exclude_start_include_end',
    coverage: [
      { year: 2025, complete: true, source: source2025, verifiedAt: '2026-09-21', scope: 'national' },
      { year: 2026, complete: true, source: source2026, verifiedAt: '2026-09-21', scope: 'national' }
    ],
    holidays: Object.entries(dates).flatMap(([year, entries]) => entries.map(([date, name]) => ({
      id: `cl-${year}-${date}`, date: `${year}-${date}`, name, scope: 'national',
      source: year === '2025' ? source2025 : source2026
    }))).sort((a, b) => a.date.localeCompare(b.date))
  };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = CCM_CALENDAR;
