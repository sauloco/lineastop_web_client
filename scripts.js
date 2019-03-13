$(document).ready(() => {
  collectionsCreator({});
})

const collectionsCreator = async (params) => {
  let consultas = await fetchData({endpoint: api.consultas.all});
  consultas = consultas.filter(v => v.fechaProximaConsulta && moment(v.fechaProximaConsulta).isAfter(moment()) && moment(v.fechaProximaConsulta).isBefore(moment().add(7, 'days')));
  // collection is the wrapper
  const wrapper = $('.collection');
  $(wrapper).html('');
  if (!consultas.length) {
    $(wrapper).html('No hay personas a contactar en los próximos días.');
  };

  for (const index in consultas) {
    const when = humanReadableDate(moment().format('DD/MM/YYYY').diff(moment(consultas[index].fechaProximaConsulta,'DD/MM/YYYY'), 'days'));
    const muestraAContactar = `<li id = "contactarA"><a href="/consultas/?id=${consultas[index]._id}" class="collection-item">${consultas[index].persona.apellido} ${consultas[index].persona.nombre} - Contactar ${when}</a></li>`;
    $(wrapper).append(muestraAContactar);
  }

}

const humanReadableDate = (diff) => {
  if (diff < 1) {
    return 'hoy';
  } else if (1 >= 24 && diff < 2) {
    return 'mañana';
  } else {
    return `en ${diff} días`;
  }
}