let PERSONAS = {};
let CONSULTAS = [];
let PLANTILLAS = [];
let Persona = {};

let Consulta = {
  _id: '',
  ingreseParaBuscar: '',
  fecha: '',
  tos: false,
  expectoracion: false,
  dolorCalambre: false,
  dolorPrecordial: false,
  dificultadRespiratoria: false,
  sueno: false,
  piel: false,
  olfato: false,
  dientes: false,
  gusto: false,
  claudicacionMi: false,
  problemaPeso: false,
  tabaquismoEnfermedad: false,
  tripleAdiccion: false,
  abandonoExperiencia: false,
  controlApoyo: false,
  cambiarVida: false,
  tratamientoFarmacologico: false,
  actividadManual: false,
  tiempoLibre: false,
  carteleria: false,
  comprometerse: false,
  corte: false,
  desayuno: false,
  actividadFisica: false,
  agua: false,
  chicles: false,
  zanahoriaManzana: false,
  autoSinTabaco: false,
  casaSinTabaco: false,
  alimentacion: false,
  cepilladoDiente: false,
  banos: false,
  reuniones: false,
  cambioMarca: false,
  otros: '',
  derivado: false,
  derivadoMedico: '',
  derivadoNotificacion: '',
  fechaAbandonoCompromiso: '',
  fechaAbandonoEfectiva: '',
  fechaProximaConsulta: '',
  observacion: '',
  persona: ''
};

let Mensaje = {
  _id: '',
  mensaje: '',
  fechaEnvio: '',
  cancelado: '',
  enviado: '',
  telefono: '',
  email: '',
  tipo: '',
  persona: ''
}

let defaultConsulta = JSON.parse(JSON.stringify(Consulta));

$(document).ready(() => {
  $('select').formSelect();
  $('#guardar').click(saveConsulta);
  initializeDatepicker();
  getAllPersonas();
  $('#finderLauncherPersonas').click(openFinderPersonas);
  $('.fixed-action-btn').floatingActionButton();
  $('#history').click(goToHistory);
  
  
  plantillasCreator();

  // por usar Materialize
  const modelCallback = () => {
    M.updateTextFields();
    $('select').formSelect();
    M.textareaAutoResize($('textarea'));
    $('.sidenav').sidenav();
    $('.tooltipped').tooltip();
    $('.fixed-action-btn').floatingActionButton();
    $('.modal').modal();
  };

  $('#toggle_detalles_persona').click(toggleDetailsPersona);

  R.s.add({
    model: 'Consulta',
    callback: modelCallback
  });

  R.s.add({
    model: 'Mensaje',
    callback: modelCallback
  });

  R.s.add({
    model: 'Consulta',
    key: 'ingreseParaBuscar',
    callback: ({prevModel, model}) => {
      if (model.ingreseParaBuscar) {
        R.mutate('Consulta', {'persona': PERSONAS[model.ingreseParaBuscar]});
      } else {
        Persona = {};
        R.mutate('Mensaje', {persona:  '', telefono: '', email: ''});
      }
      toggleDetails(prevModel, model);
    }
  })

  R.s.add({
    model: 'Consulta',
    key: 'fecha',
    callback: ({
      prevModel,
      model
    }) => {
      const hoy = moment();
      if (moment(model.fecha, DATE_FORMAT_ES).isAfter(moment(hoy))) {
        M.toast({
          html: 'La fecha de la consulta no puede ser futura.'
        });
        R.mutate('Consulta', {
          'fecha': prevModel.fecha
        });
      }
      if (model.ingreseParaBuscar) {
        R.mutate('Consulta', {'persona': PERSONAS[model.ingreseParaBuscar]});
      }
      if (prevModel.persona && prevModel.persona._id) {
        prevModel.persona = prevModel.persona._id;
      }
      toggleDetails(prevModel, model);
    }
  });

  R.s.add({
    model: 'Consulta',
    key: 'compromisoAbandono',
    callback: ({
      prevModel,
      model
    }) => {
      const hoy = moment();
      if (moment(model.compromisoAbandono, DATE_FORMAT_ES).isBefore(moment(hoy))) {
        M.toast({
          html: 'La fecha de compromiso no puede ser anterior a hoy.'
        });
        R.mutate('Consulta', {
          'compromisoAbandono': prevModel.compromisoAbandono
        });
        return;
      }
    }
  });

  R.s.add({
    model: 'Consulta',
    key: 'abandonoEfectivo',
    callback: ({
      prevModel,
      model
    }) => {
      const hoy = moment();
      if (moment(model.abandonoEfectivo, DATE_FORMAT_ES).isAfter(moment(hoy))) {
        M.toast({
          html: 'La fecha de abandono efectivo no puede ser futura.'
        });
        R.mutate('Consulta', {
          'abandonoEfectivo': prevModel.abandonoEfectivo
        });
        return;
      }
    }
  });

  R.s.add({
    model: 'Consulta',
    key: 'proximaConsulta',
    callback: ({
      prevModel,
      model
    }) => {
      const hoy = moment();
      if (moment(model.proximaConsulta, DATE_FORMAT_ES).isBefore(moment(hoy))) {
        M.toast({
          html: 'La fecha de próxima consulta no puede ser anterior a hoy.'
        })
        R.mutate('Consulta', {
          'proximaConsulta': prevModel.proximaConsulta
        });
        return;
      }
    }
  });

  R.s.add({
    model: 'Consulta',
    key: 'derivado',
    callback: ({
      prevModel,
      model
    }) => {
      if (model.derivado) {
        $('#medicoDerivadoDetails').removeClass('hide');
        $('#notificacionAlMedicoDetails').removeClass('hide');

      } else {
        $('#medicoDerivadoDetails').addClass('hide');
        $('#notificacionAlMedicoDetails').addClass('hide');

      }
    }
  });

  R.s.add({
    model: 'Consulta',
    key: '_id',
    callback: ({
      prevModel,
      model
    }) => {
      if (model._id) {
        if (CONSULTAS.length && model._id !== prevModel._id) {
          const targetConsultaIdx = CONSULTAS.map((v, i) => {
            if (v._id === model._id){
              return i;
            }
          }).filter(v => v)[0];
          goTo(targetConsultaIdx);
          // R.mutate('Consulta', currentConsulta);
        } else {
          loadConsultaById(model._id);
        }
      }
    }
  });

  R.s.add({model: 'Mensaje', key: 'tipo', callback: ({prevModel, model}) => {
    toggleEnviar(model);
  }});

  R.s.add({model: 'Mensaje', key: 'mensaje', callback: ({prevModel, model}) => {
    toggleEnviar(model);
  }});

  // Inicialización
  R.init('Mensaje');
  R.init('Consulta');
  

  const url = new URL(location.href);
  const _id = url.searchParams.get('id');

  if (_id) {
    R.mutate('Consulta', {_id});
  }

})

const toggleDetailsPersona = (event) => {
  if ($(event.target).prop('checked')) {
    $('#persona_details_wrapper').removeClass('hide');
    $('#persona_details_wrapper_helper').addClass('hide');
  } else {
    $('#persona_details_wrapper').addClass('hide');
    $('#persona_details_wrapper_helper').removeClass('hide');
  }
}

const loadConsultaById = async _id => {
  const data = await fetchData({endpoint: api.consultas.get, params: {_id}});
  if (data.statusCode === 404) {
    M.toast({html:'No se encontró ninguna consulta con la información proporcionada.'});
    R.mutate('Consulta', {_id: ''});
    return;
  }
  const ingreseParaBuscar = Object.keys(PERSONAS);
  for (const idx of ingreseParaBuscar) {
    if (PERSONAS[idx] === data.persona._id) {
      Persona = data.persona;
      R.mutate('Mensaje', {persona:  data.persona._id, telefono: data.persona.telefono, email: data.persona.email});
      data.persona = data.persona._id;
      data.ingreseParaBuscar = idx;
      data.fecha = displayDate(data.fecha);
      R.mutate('Consulta', data);
      return;
    }
  }
  
}

const saveConsulta = async (silent) => {
  const params = JSON.parse(JSON.stringify(Consulta));

  if(params.fecha){
    params.fecha = normalizeDate(params.fecha);
  } else {
    if (!silent) {
      M.toast('La fecha de la consulta es obligatoria');
    }
    return;
  }

  if(params.compromisoAbandono){
    params.compromisoAbandono = normalizeDate(params.compromisoAbandono);
  }
  if(params.abandonoEfectivo){
    params.abandonoEfectivo = normalizeDate(params.abandonoEfectivo);
  }
  if(params.proximaConsulta){
    params.proximaConsulta = normalizeDate(params.proximaConsulta);
  }
  let result = false;
  if (!Consulta._id) {
    delete params['_id'];
    result = createConsulta(params);
  } else {
    result = updateConsulta(params);
  }
  if (result.toString() === 'true') {
    if (!silent) {
      M.toast({html:'Los datos de la persona se han guardado correctamente'});
      return true;
    }
  }

}

const createConsulta = async(params) => {
  const data = await fetchData({endpoint: api.consultas.create, params});
  if(data.error){
    return api.common.errorHandler({endpoint: api.consultas.create, error: data});
  }
  CONSULTAS.push(data);
  navigatorCreator();
  carouselCreator();
  goTo(CONSULTAS.length - 1);
  // R.mutate('Consulta',{_id: data._id});   
  return true;
}

const updateConsulta = async (params) => {
  const data = await fetchData({endpoint: api.consultas.update, params});
  if(data.error){
    return api.common.errorHandler({endpoint: api.consultas.update, error: data});
  }
  return true;
}

const getAllPersonas = async () => {
  const personas = await fetchData({endpoint: api.personas.all});
  const data = [];
  PERSONAS = [];
  for (persona of personas) {
    data[`${persona.apellido} ${persona.nombre} (${persona.telefono}. ${persona.email})`] = null;
    PERSONAS[`${persona.apellido} ${persona.nombre} (${persona.telefono}. ${persona.email})`] = persona._id;
  }
  
  $('input.autocomplete').autocomplete({data});
}

const openFinderPersonas = () => {
  initFinder('personas', '#preloader_modal');

  const modal = M.Modal.getInstance(document.querySelector('#buscadorPersonas'));
  modal.open();
}

const toggleDetails = (prevModel, model) => {
  if (model.persona) {
    navigatorCreator();
    carouselCreator();
    $('.navigator_wrapper').removeClass('hide');
    if (prevModel.persona !== model.persona) {
      $('#persona_details').prop('src', `/personas/?nav=false&id=${model.persona}`);
    }
    if (model.fecha) {
      $('.wrapper').removeClass('hide');
    } else {
      $('.wrapper').addClass('hide');
    }
  } else {
    $('.wrapper').addClass('hide');
    $('.navigator_wrapper').addClass('hide');
  }
}

const navigatorCreator = async () => {
  CONSULTAS = await fetchData({endpoint: api.consultas.findBy, params: {persona: PERSONAS[Consulta.ingreseParaBuscar]}});
  // pagination is the wrapper
  const wrapper = $('.pagination');
  $(wrapper).html('');
  if (!CONSULTAS.length) {
    $(wrapper).html('Cargue una nueva consulta para esta persona');  
    return;
  }
  const goToFirst = `<li id = "goToFirst" title = "Primera: ${displayDate(CONSULTAS[0].fecha)}"><a href="#" onClick = "goTo(0)"><i class="material-icons left">first_page</i></a></li>`;
  let disableLast = false;
  
  $(wrapper).append(goToFirst)
  for (const index in CONSULTAS) {
    let disableClick = false;
    let setClass = "";
    if (CONSULTAS[index]._id === Consulta._id) {
      setClass += " active blue";
      disableClick = true;
      if (+index === 0) {
        $("#goToFirst").addClass('disabled');
      }
      if (+index === CONSULTAS.length - 1) {
        disableLast = true;
      }
    }
    const goTo = `<li class = "${setClass}" id = "goTo${index}" title = "${displayDate(CONSULTAS[index].fecha)}"}><a href="#" ${disableClick ? '' : `onClick = "goTo(${index})"`}>${+index + 1}</a></li>`;
    $(wrapper).append(goTo)
  }
  const goToLast = `<li class = "${disableLast ? 'disabled' : ''}" id = "goToLast" title = "Última: ${displayDate(CONSULTAS[CONSULTAS.length - 1].fecha)}"><a href="#" onClick = "goTo(${CONSULTAS.length - 1})"><i class="material-icons right">last_page</i></a></li>`;
  $(wrapper).append(goToLast)
  const goToNew = `<li class = "blue darken-1" id = "goToNew"><a href="#" class = "white-text" onClick = "goToNew()">Nueva</a></li>`;
  $(wrapper).append(goToNew)
  $('.tooltipped').tooltip();
}

const goToNew = () => {
  defaultConsulta.ingreseParaBuscar = Consulta.ingreseParaBuscar;
  defaultConsulta.persona = Consulta.persona;
  R.mutate('Consulta', defaultConsulta);
  updateURL(Consulta);
}

const goTo = (index) => {
  if (index === undefined) {
    return;
  }
  const data = JSON.parse(JSON.stringify(CONSULTAS[index]));
  data.fecha = displayDate(data.fecha);
  R.mutate('Consulta', data);
  updateURL(Consulta);
  if (index === 0) {
    $('#goToFirst').addClass('disabled');
  } else {
    $('#goToFirst').removeClass('disabled');
  }

  if (index === (CONSULTAS.length - 1)) {
    $('#goToLast').addClass('disabled');
  } else {
    $('#goToLast').removeClass('disabled');
  }

  for (tempIndex in CONSULTAS) {
    if (+tempIndex === index) {
      $(`#goTo${tempIndex}`).removeClass('waves-effect');
      $(`#goTo${tempIndex}`).addClass('active');
      $(`#goTo${tempIndex}`).addClass('blue');
    } else {
      $(`#goTo${tempIndex}`).removeClass('active');
      $(`#goTo${tempIndex}`).removeClass('blue');
      $(`#goTo${tempIndex}`).addClass('waves-effect');
    }
  }
}

const updateURL = (model) => {
  let currentId, mode;
  if (location.href.indexOf('?') >= 0) {
    mode = 'add';
    const paramsString = location.href.split('?')[1];
    if (paramsString.indexOf('id=') >= 0) {
      mode = 'edit';
      currentId = new URL(location.href).searchParams.get('id');
    }
  } else {
    mode = 'first';
  }
  let newURL = '';
  if (model._id === '' && mode === 'edit') {
    mode = 'empty';
    newURL = '/consultas/';
  }
  if (model._id !== currentId) {
    switch (mode) {
      case 'empty':
        window.history.replaceState( {} , '', newURL);
        break;
      case 'first':
        newURL = "?";
      case 'add':
        newURL = `${newURL}id=${model._id}`;
        window.history.replaceState( {} , '', newURL);
        break;
      case 'edit':
        newURL =  location.href.split('?')[1].split(currentId).join(model._id);
        window.history.replaceState( {} , '', `?${newURL}`);
        break;
    }
  }
}

const plantillasCreator = async () => {
  if (!PLANTILLAS.length) {
    const data = await fetchData({endpoint: api.plantillaMensaje.findBy});
    PLANTILLAS = JSON.parse(JSON.stringify(data));
  }  
  const wrapper = $('#plantillas.collection');
  for (const index in PLANTILLAS) {
    const plantilla = PLANTILLAS[index]
    wrapper.append(`<li class="collection-item"><div>${plantilla.titulo}<a href="#!" class="secondary-content" onClick = copyPlantilla(${index})><i class="material-icons blue-text">file_copy</i></a></div></li>`);
  }
}

const copyPlantilla = (index) => {
  const mensaje = eval('`'+PLANTILLAS[index].cuerpo.split('{{').join('${').split('}}').join('}')+'`');
  const tipo = PLANTILLAS[index].usarEn;
  R.mutate('Mensaje', {mensaje, tipo});
  M.textareaAutoResize($('#mensaje'));
  return mensaje;
}



const carouselCreator = async () => {
  const response = await fetch('/assets/campaigns/availableAssets.json');
  const descriptor = await response.json();
  const wrapper = $('.carousel')
  let i = 0;
  for (const {title, alt, url} of descriptor) {
    wrapper.append(`<a class="carousel-item" href="#${i++}!"><h3 class = "center">${title}</h3><img alt="${alt}" src="${url}"></a>`);
  }
  $('.carousel.carousel-slider').carousel({
    fullWidth: true,
    indicators: true
  });
}

const toggleEnviar = ({tipo, mensaje}) => {
  $('#enviar_email').addClass('disabled');
  $('#enviar_whatsapp').addClass('disabled');
  if (mensaje) {
    if (tipo === 'ambos') {
      $('#enviar_email').removeClass('disabled');
      $('#enviar_whatsapp').removeClass('disabled');
    } else {
      $(`#enviar_${tipo}`).removeClass('disabled');
    }
  }
  
  M.textareaAutoResize($('#mensaje')); 
}

const goToHistory = () => {
  if (Consulta.ingreseParaBuscar === "") {
    M.toast({html: "Seleccione una persona para ver sus datos históricos"});
    return;
  }
  if (!CONSULTAS.length) {
    M.toast({html: "La persona seleccionada no posee consultas aún"});
    return;
  }
  window.open(`/historico/?id=${Persona._id}`);
}