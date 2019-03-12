$(document).ready(() => {
  const url = new URL(location.href);
  const _id = url.searchParams.get('id');
  tablesCreator({
    persona: _id
  });

})


const tablesCreator = async (params) => {
  let CONSULTAS = await fetchData({
    endpoint: api.consultas.findBy,
    params
  });
  const wrapper = $('.sintomasClinicos');
  $(wrapper).html('');
  if (!CONSULTAS.length) {
    $(wrapper).html('Cargue una nueva consulta para esta persona');
  };

  for (const index in CONSULTAS.reverse()) {
    const muestraDatos = `<tr>
    <td><a href="/consultas/?id=${CONSULTAS[index]._id}" title = "${displayDate(CONSULTAS[index].fecha)}">${moment(CONSULTAS[index].fecha).fromNow()}</a></td>
    <td>${CONSULTAS[index].tos ? 'Sí':'No'}</td>
    <td>${CONSULTAS[index].expectoracion ? 'Sí':'No'}</td>
    <td>${CONSULTAS[index].dolorCalambre ? 'Sí':'No'}</td>
    <td>${CONSULTAS[index].dolorPrecordial ? 'Sí':'No'}</td>
    <td>${CONSULTAS[index].dificultadRespiratoria ? 'Sí':'No'}</td>
    <td>${CONSULTAS[index].sueno ? 'Sí':'No'}</td>
    <td>${CONSULTAS[index].piel ? 'Sí':'No'}</td>
    <td>${CONSULTAS[index].olfato ? 'Sí':'No'}</td>
    <td>${CONSULTAS[index].dientes ? 'Sí':'No'}</td>
    <td>${CONSULTAS[index].gusto ? 'Sí':'No'}</td>
    <td>${CONSULTAS[index].claudicacionMi ? 'Sí':'No'}</td>
    <td>${CONSULTAS[index].problemaPeso ? 'Sí':'No'}</td>
    </tr>`;
    $(wrapper).append(muestraDatos);
  }

}