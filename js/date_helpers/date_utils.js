const DATE_FORMAT_ES = 'DD/MM/YYYY';

/**
 * Por defecto inicializa todos los datepickers en español y con el formato adecuado
 * @param {string} options las opciones correspondientes a la documentación de MaterializeCSS (https://materializecss.com/pickers.html)
 * @param {string} selector el selector para seleccionar uno de los datepickers, 
 *                          si no se envía se aplicarán las opciones a todos los elementos con la class .datepicke
 */
const initializeDatepicker = async (options, selector) => {
  selector = selector || '.datepicker';
  options = options || {};

  if (!options.format) {
    options.format = DATE_FORMAT_ES.toLowerCase()
  }
  if (options.showClearBtn === undefined) {
    options.showClearBtn = true;
  }
  const response = await fetch('/js/date_helpers/datepicker_i18n_ES.json');
  options.i18n = await response.json();

  $(selector).datepicker(options);
}

const displayDate = (normalizedDate) => {
  return moment(new Date(normalizedDate)).format('DD/MM/YYYY');
};

const normalizeDate = (displayedDate) => {
  return moment(displayedDate, 'DD/MM/YYYY').toString(); 
}

const normalizeDateTime = (displayedDateTime) => {
  return moment(displayedDateTime, 'DD/MM/YYYY hh:mm:ss').toString(); 
}

const humanReadableDate = (futureDate) => {
  const today = moment().startOf('day');
  const tomorrow = moment().add(1, 'days').startOf('day');
  if (futureDate.isSame(today, 'd')) {
    return 'hoy';
  } 
  if (futureDate.isSame(tomorrow, 'd')) {
    return 'mañana';
  }
  const diff = futureDate.diff(today, 'days');
  return `en ${diff} días`;
}