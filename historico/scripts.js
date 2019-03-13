
$(document).ready(() => {
  const url = new URL(location.href);
  const _id = url.searchParams.get('id');
  tablesCreator({
    persona: _id
  });
  moment.lang('es');
})

const tablesCreator = async (params) => {
  let CONSULTAS = await fetchData({
    endpoint: api.consultas.findBy,
    params
  });
   $('.nombrePersona').html(`<h5>Datos historicos de ${CONSULTAS[0].persona.apellido} ${CONSULTAS[0].persona.nombre}</h5>`);

  /*const wrapper = $('.sintomasClinicos');
   $(wrapper).html('');
  if (!CONSULTAS.length) {
    $(wrapper).html('Cargue una nueva consulta para esta persona');
  }; */

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
    $('.sintomasClinicos').append(muestraDatos);

  }    
    for (const index in CONSULTAS.reverse()) {
      const muestraDatos = `<tr>
      <td><a href="/consultas/?id=${CONSULTAS[index]._id}" title = "${displayDate(CONSULTAS[index].fecha)}">${moment(CONSULTAS[index].fecha).fromNow()}</a></td>
      <td>${CONSULTAS[index].tabaquismoEnfermedad ? 'Sí':'No'}</td>
      <td>${CONSULTAS[index].tripleAdiccion ? 'Sí':'No'}</td>
      <td>${CONSULTAS[index].abandonoExperiencia ? 'Sí':'No'}</td>
      <td>${CONSULTAS[index].controlApoyo ? 'Sí':'No'}</td>
      <td>${CONSULTAS[index].cambiarVida ? 'Sí':'No'}</td>
      <td>${CONSULTAS[index].tratamientoFarmacologico ? 'Sí':'No'}</td>
      </tr>`;
      $('.tratamientosCognitivos').append(muestraDatos);
  }

  for (const index in CONSULTAS.reverse()) {
    const muestraDatos = `<tr>
    <td><a href="/consultas/?id=${CONSULTAS[index]._id}" title = "${displayDate(CONSULTAS[index].fecha)}">${moment(CONSULTAS[index].fecha).fromNow()}</a></td>
    <td>${CONSULTAS[index].actividadManual ? 'Sí':'No'}</td>
    <td>${CONSULTAS[index].tiempoLibre ? 'Sí':'No'}</td>
    <td>${CONSULTAS[index].cartelaria ? 'Sí':'No'}</td>
    <td>${CONSULTAS[index].comprometerse ? 'Sí':'No'}</td>
    <td>${CONSULTAS[index].corte ? 'Sí':'No'}</td>
    <td>${CONSULTAS[index].desayuno ? 'Sí':'No'}</td>
    <td>${CONSULTAS[index].actividadFisica ? 'Sí':'No'}</td>
    <td>${CONSULTAS[index].agua ? 'Sí':'No'}</td>
    <td>${CONSULTAS[index].chicles ? 'Sí':'No'}</td>
    <td>${CONSULTAS[index].zanahoriaManzana ? 'Sí':'No'}</td>
    <td>${CONSULTAS[index].autoSinTabaco ? 'Sí':'No'}</td>
    <td>${CONSULTAS[index].casaSinTabaco ? 'Sí':'No'}</td>
    <td>${CONSULTAS[index].alimentacion ? 'Sí':'No'}</td>
    <td>${CONSULTAS[index].cepilladoDiente ? 'Sí':'No'}</td>
    <td>${CONSULTAS[index].banos ? 'Sí':'No'}</td>
    <td>${CONSULTAS[index].reuniones ? 'Sí':'No'}</td>
    <td>${CONSULTAS[index].cambiaMarca ? 'Sí':'No'}</td>
    <td>${CONSULTAS[index].otros}</td>
    </tr>`;
    $('.tratamientoConductual').append(muestraDatos);
  }  

  for (const index in CONSULTAS.reverse()) {
    const muestraDatos = `<tr>
    <td><a href="/consultas/?id=${CONSULTAS[index]._id}" title = "${displayDate(CONSULTAS[index].fecha)}">${moment(CONSULTAS[index].fecha).fromNow()}</a></td>
    <td>${CONSULTAS[index].derivado ? 'Sí':'No'}</td>
    <td>${CONSULTAS[index].derivadoMedico ? 'Sí':'No'}</td>
    <td>${CONSULTAS[index].derivadoNotificacion ? 'Sí':'No'}</td>
    <td>${CONSULTAS[index].fechaAbandonoCompromiso ? 'Sí':'No'}</td>
    <td>${CONSULTAS[index].fechaAbandonoEfectiva ? 'Sí':'No'}</td>
    <td>${CONSULTAS[index].fechaProximaConsulta ? 'Sí':'No'}</td>
    <td>${CONSULTAS[index].observacion ? 'Sí':'No'}</td>

    </tr>`;
    $('.conductaTerapeutica').append(muestraDatos);
  }
}