$(document).ready(() => {
  const url = new URL(location.href);
  const _id = url.searchParams.get('id');
  collectionsCreator({persona: _id});

})


const collectionsCreator = async (params) => {
  let CONSULTAS = await fetchData({endpoint: api.consultas.findBy, params});
  // collection is the wrapper
  const wrapper = $('.sintomasClinicos');
  $(wrapper).html('');
  if (!CONSULTAS.length) {
    $(wrapper).html('Cargue una nueva consulta para esta persona');
  };

  for (const index in CONSULTAS) {
    const muestraDatos = `<tr>
    <td <a href="/consultas/?id=${CONSULTAS[index]._id}" class="collection-item">${CONSULTAS[index].tos ? 'Sí':'No'}</a></td>
    <td <a href="/consultas/?id=${CONSULTAS[index]._id}" class="collection-item">${CONSULTAS[index].expectoracion ? 'Sí':'No'}</a></td>
    <td <a href="/consultas/?id=${CONSULTAS[index]._id}" class="collection-item">${CONSULTAS[index].dolorCalambre ? 'Sí':'No'}</a></td>
    <td <a href="/consultas/?id=${CONSULTAS[index]._id}" class="collection-item">${CONSULTAS[index].dolorPrecordial ? 'Sí':'No'}</a></td>
    <td <a href="/consultas/?id=${CONSULTAS[index]._id}" class="collection-item">${CONSULTAS[index].dificultadRespiratoria ? 'Sí':'No'}</a></td>
    <td <a href="/consultas/?id=${CONSULTAS[index]._id}" class="collection-item">${CONSULTAS[index].sueño ? 'Sí':'No'}</a></td>
    <td <a href="/consultas/?id=${CONSULTAS[index]._id}" class="collection-item">${CONSULTAS[index].piel ? 'Sí':'No'}</a></td>
    <td <a href="/consultas/?id=${CONSULTAS[index]._id}" class="collection-item">${CONSULTAS[index].olfato ? 'Sí':'No'}</a></td>
    <td <a href="/consultas/?id=${CONSULTAS[index]._id}" class="collection-item">${CONSULTAS[index].dientes ? 'Sí':'No'}</a></td>
    <td <a href="/consultas/?id=${CONSULTAS[index]._id}" class="collection-item">${CONSULTAS[index].gusto ? 'Sí':'No'}</a></td>
    <td <a href="/consultas/?id=${CONSULTAS[index]._id}" class="collection-item">${CONSULTAS[index].claudicacionMi ? 'Sí':'No'}</a></td>
    <td <a href="/consultas/?id=${CONSULTAS[index]._id}" class="collection-item">${CONSULTAS[index].problemaPeso ? 'Sí':'No'}</a></td>
    </tr>`;
    $(wrapper).append(muestraDatos);
  }

}