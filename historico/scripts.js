
$(document).ready(() => {
  const url = new URL(location.href);
  const _id = url.searchParams.get('id');
  tablesCreator({
    persona: _id
  });
  moment.lang('es');
})
if (!params.persona) {
  $('.nombrePersona').html(`<h5>El dato de la persona es requerido para mostrar su historia</h5>`)
  return;
}

const tablesCreator = async (params) => {
  let CONSULTAS = await fetchData({
    endpoint: api.consultas.findBy,
    params
  });

  if(CONSULTAS.error){
    return api.common.errorHandler({endpoint: api.consultas, error: data});
}

 /*  if (params.persona !== "") {
      if (!CONSULTAS.length) {  
        $('.nombrePersona').html(`<h5>La persona seleccionada no tiene consultas</h5>`)
      }
    } else {
      $('.nombrePersona').html(`<h5>El dato de la persona es requerido para mostrar su historia</h5>`)
    }; */

  $('.nombrePersona').html(`<h5>Datos historicos de ${CONSULTAS[0].persona.apellido} ${CONSULTAS[0].persona.nombre}</h5>`);

  for (const consulta of CONSULTAS.reverse()) {

    const muestraSintomasClinicos = `<tr>
    <td><a href="/consultas/?id=${consulta._id}" title = "${displayDate(consulta.fecha)}">${moment(consulta.fecha).fromNow()}</a></td>
    <td>${consulta.tos ? 'Sí':'No'}</td>
    <td>${consulta.expectoracion ? 'Sí':'No'}</td>
    <td>${consulta.dolorCalambre ? 'Sí':'No'}</td>
    <td>${consulta.dolorPrecordial ? 'Sí':'No'}</td>
    <td>${consulta.dificultadRespiratoria ? 'Sí':'No'}</td>
    <td>${consulta.sueno ? 'Sí':'No'}</td>
    <td>${consulta.piel ? 'Sí':'No'}</td>
    <td>${consulta.olfato ? 'Sí':'No'}</td>
    <td>${consulta.dientes ? 'Sí':'No'}</td>
    <td>${consulta.gusto ? 'Sí':'No'}</td>
    <td>${consulta.claudicacionMi ? 'Sí':'No'}</td>
    <td>${consulta.problemaPeso ? 'Sí':'No'}</td>
    </tr>`;
    $('.sintomasClinicos').append(muestraSintomasClinicos);

    const muestraTratamientosCognitivos= `<tr>
    <td><a href="/consultas/?id=${consulta._id}" title = "${displayDate(consulta.fecha)}">${moment(consulta.fecha).fromNow()}</a></td>
    <td>${consulta.tabaquismoEnfermedad ? 'Sí':'No'}</td>
    <td>${consulta.tripleAdiccion ? 'Sí':'No'}</td>
    <td>${consulta.abandonoExperiencia ? 'Sí':'No'}</td>
    <td>${consulta.controlApoyo ? 'Sí':'No'}</td>
    <td>${consulta.cambiarVida ? 'Sí':'No'}</td>
    <td>${consulta.tratamientoFarmacologico ? 'Sí':'No'}</td>
    </tr>`;
    $('.tratamientosCognitivos').append(muestraTratamientosCognitivos);
  
    const muestraTratamientoConductual = `<tr>
    <td><a href="/consultas/?id=${consulta._id}" title = "${displayDate(consulta.fecha)}">${moment(consulta.fecha).fromNow()}</a></td>
    <td>${consulta.actividadManual ? 'Sí':'No'}</td>
    <td>${consulta.tiempoLibre ? 'Sí':'No'}</td>
    <td>${consulta.cartelaria ? 'Sí':'No'}</td>
    <td>${consulta.comprometerse ? 'Sí':'No'}</td>
    <td>${consulta.corte ? 'Sí':'No'}</td>
    <td>${consulta.desayuno ? 'Sí':'No'}</td>
    <td>${consulta.actividadFisica ? 'Sí':'No'}</td>
    <td>${consulta.agua ? 'Sí':'No'}</td>
    <td>${consulta.chicles ? 'Sí':'No'}</td>
    <td>${consulta.zanahoriaManzana ? 'Sí':'No'}</td>
    <td>${consulta.autoSinTabaco ? 'Sí':'No'}</td>
    <td>${consulta.casaSinTabaco ? 'Sí':'No'}</td>
    <td>${consulta.alimentacion ? 'Sí':'No'}</td>
    <td>${consulta.cepilladoDiente ? 'Sí':'No'}</td>
    <td>${consulta.banos ? 'Sí':'No'}</td>
    <td>${consulta.reuniones ? 'Sí':'No'}</td>
    <td>${consulta.cambiaMarca ? 'Sí':'No'}</td>
    <td>${consulta.otros}</td>
    </tr>`;
    $('.tratamientoConductual').append(muestraTratamientoConductual);
 
    const muestraConductaTerapeutica = `<tr>
    <td><a href="/consultas/?id=${consulta._id}" title = "${displayDate(consulta.fecha)}">${moment(consulta.fecha).fromNow()}</a></td>
    <td>${consulta.derivado ? 'Sí':'No'}</td>
    <td>${consulta.derivadoMedico ? 'Sí':'No'}</td>
    <td>${consulta.derivadoNotificacion ? 'Sí':'No'}</td>
    <td>${consulta.fechaAbandonoCompromiso ? 'Sí':'No'}</td>
    <td>${consulta.fechaAbandonoEfectiva ? 'Sí':'No'}</td>
    <td>${consulta.fechaProximaConsulta ? 'Sí':'No'}</td>
    <td>${consulta.observacion ? 'Sí':'No'}</td>
    </tr>`;
    $('.conductaTerapeutica').append(muestraConductaTerapeutica);
  }
}