let PERSONAS = {};
let CONSULTAS = [];
let PLANTILLAS = [];
let Persona = {};
let galleryLoaded = false;
let historicoLoaded = false;

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
  subject: 'Linea Stop | Seguimiento',
  texto: '',
  programarEnvio: false,
  fechaEnvio: moment().format(DATE_FORMAT_ES),
  cancelado: false,
  enviado: false,
  telefono: '',
  email: '',
  tipo: 'email',
  persona: ''
}

const defaultMensaje = JSON.parse(JSON.stringify(Mensaje));

let defaultConsulta = JSON.parse(JSON.stringify(Consulta));

$(document).ready(async () => {
  $('select').formSelect();
  $('#guardar').click(saveConsultaVerbosely);
  initializeDatepicker();
  await getAllPersonas();
  $('#finderLauncherPersonas').click(openFinderPersonas);
  $('.fixed-action-btn').floatingActionButton();
  $('#history').click(goToHistory);
  $('#enviar').click(sendMessage);
  $('#preview').click(previewMessage);
  $('.modal').modal();
  moment.locale('es');

  plantillasCreator();

  // por usar Materialize
  const modelCallback = () => {
    M.updateTextFields();
    $('select').formSelect();
    M.textareaAutoResize($('textarea'));
    $('.sidenav').sidenav();
    $('.tooltipped').tooltip();
    $('.fixed-action-btn').floatingActionButton();

    saveConsultaSilently();
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
    callback: ({
      prevModel,
      model
    }) => {
      if (model.ingreseParaBuscar) {
        R.mutate('Consulta', {
          'persona': PERSONAS[model.ingreseParaBuscar]
        });
      } else {
        Persona = {};
        R.mutate('Mensaje', {
          persona: '',
          telefono: '',
          email: ''
        });
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
          html: 'La fecha de la consulta no debe ser futura.'
        });
        if (prevModel._id === model._id) {
          R.mutate('Consulta', {
            'fecha': prevModel.fecha
          });
        } else {
          R.mutate('Consulta', {
            'fecha': ''
          });
        }

      }
      if (model.ingreseParaBuscar) {
        R.mutate('Consulta', {
          'persona': PERSONAS[model.ingreseParaBuscar]
        });
      }
      if (prevModel.persona && prevModel.persona._id) {
        prevModel.persona = prevModel.persona._id;
      }
      toggleDetails(prevModel, model);

    }
  });

  R.s.add({
    model: 'Consulta',
    key: 'fechaAbandonoCompromiso',
    callback: ({
      prevModel,
      model
    }) => {
      const hoy = moment();
      if (moment(model.fechaAbandonoCompromiso, DATE_FORMAT_ES).isBefore(moment(model.fecha, DATE_FORMAT_ES))) {
        M.toast({
          html: 'La fecha de compromiso no debe ser anterior a la fecha de la consulta.'
        });
        if (prevModel._id === model._id) {
          R.mutate('Consulta', {
            'fechaAbandonoCompromiso': prevModel.fechaAbandonoCompromiso
          });
        } else {
          R.mutate('Consulta', {
            'fechaAbandonoCompromiso': ''
          });
        }
        return;
      }
    }
  });

  R.s.add({
    model: 'Consulta',
    key: 'fechaAbandonoEfectiva',
    callback: ({
      prevModel,
      model
    }) => {
      const hoy = moment();
      if (moment(model.fechaAbandonoEfectiva, DATE_FORMAT_ES).isAfter(moment(model.fecha, DATE_FORMAT_ES))) {
        M.toast({
          html: 'La fecha de abandono efectivo no debe ser posterior a la fecha de la consulta.'
        });
        if (prevModel._id === model._id) {
          R.mutate('Consulta', {
            'fechaAbandonoEfectiva': prevModel.fechaAbandonoEfectiva
          });
        } else {
          R.mutate('Consulta', {
            'fechaAbandonoEfectiva': ''
          });
        }
        return;
      }
    }
  });

  R.s.add({
    model: 'Consulta',
    key: 'fechaProximaConsulta',
    callback: ({
      prevModel,
      model
    }) => {
      const hoy = moment();
      if (moment(model.fechaProximaConsulta, DATE_FORMAT_ES).isBefore(moment(model.fecha, DATE_FORMAT_ES))) {
        M.toast({
          html: 'La fecha de próxima consulta no puede ser anterior a la fecha de la consulta.'
        })
        if (prevModel._id === model._id) {
          R.mutate('Consulta', {
            'fechaProximaConsulta': prevModel.fechaProximaConsulta
          });
        } else {
          R.mutate('Consulta', {
            'fechaProximaConsulta': ''
          });
        }

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
            if (v._id === model._id) {
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

  R.s.add({
    model: 'Mensaje',
    key: 'tipo',
    callback: ({
      prevModel,
      model
    }) => {
      const wrapper = $('.subject_wrapper');
      if (model.tipo === 'whatsapp') {
        wrapper.addClass('hide');
      } else {
        wrapper.removeClass('hide');
      }
      M.textareaAutoResize($('#texto'));
    }
  });

  R.s.add({
    model: 'Mensaje',
    key: 'programarEnvio',
    callback: ({
      prevModel,
      model
    }) => {
      const wrapper = $('.fechaEnvio_wrapper');
      $('#enviar').off('click');
      if (model.programarEnvio) {
        wrapper.removeClass('hide');
        $('#enviarIcon').html('schedule');
        $('#enviar').attr('data-tooltip', 'Programar envio');
        $('#enviar').click(sendLater);
      } else {
        wrapper.addClass('hide');
        $('#enviarIcon').html('send');
        $('#enviar').attr('data-tooltip', 'Enviar ahora');
        $('#enviar').click(sendMessage);
      }
      $('.tooltiped').tooltip();
    }
  });

  R.s.add({
    model: 'Mensaje',
    key: 'fechaEnvio',
    callback: ({
      prevModel,
      model
    }) => {

    }
  });

  // Inicialización
  R.init('Mensaje');
  R.init('Consulta');


  const url = new URL(location.href);
  const _id = url.searchParams.get('id');

  if (_id) {
    R.mutate('Consulta', {
      _id
    });
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
  const data = await fetchData({
    endpoint: api.consultas.get,
    params: {
      _id
    }
  });
  if (data.statusCode === 404) {
    M.toast({
      html: 'No se encontró ninguna consulta con la información proporcionada.'
    });
    R.mutate('Consulta', {
      _id: ''
    });
    return;
  }
  const ingreseParaBuscar = Object.keys(PERSONAS);
  for (const idx of ingreseParaBuscar) {
    if (PERSONAS[idx] === data.persona._id) {
      Persona = data.persona;
      R.mutate('Mensaje', {
        persona: data.persona._id,
        telefono: data.persona.telefono,
        email: data.persona.email
      });
      data.persona = data.persona._id;
      data.ingreseParaBuscar = idx;
      data.fecha = displayDate(data.fecha);
      if (data.fechaAbandonoCompromiso) {
        data.fechaAbandonoCompromiso = displayDate(data.fechaAbandonoCompromiso);
      }
      if (data.fechaAbandonoEfectiva) {
        data.fechaAbandonoEfectiva = displayDate(data.fechaAbandonoEfectiva);
      }
      if (data.fechaProximaConsulta) {
        data.fechaProximaConsulta = displayDate(data.fechaProximaConsulta);
      }
      R.mutate('Consulta', data);
      return;
    }
  }

}

const saveConsultaSilently = () => {
  return saveConsulta(true);
}

const saveConsultaVerbosely = () => {
  return saveConsulta(false);
}

const saveConsulta = async (silent) => {
  const params = JSON.parse(JSON.stringify(Consulta));
  if (!params.persona) {
    if (!silent) {
      M.toast('La persona es obligatoria');
    }
    return;
  }
  if (params.fecha) {
    params.fecha = normalizeDate(params.fecha);
  } else {
    if (!silent) {
      M.toast('La fecha de la consulta es obligatoria');
    }
    return;
  }

  if (params.fechaAbandonoCompromiso) {
    params.fechaAbandonoCompromiso = normalizeDate(params.fechaAbandonoCompromiso);
  }
  if (params.fechaAbandonoEfectiva) {
    params.fechaAbandonoEfectiva = normalizeDate(params.fechaAbandonoEfectiva);
  }
  if (params.fechaProximaConsulta) {
    params.fechaProximaConsulta = normalizeDate(params.fechaProximaConsulta);
  }
  let result = false;
  if (!Consulta._id) {
    delete params['_id'];
    result = createConsulta(params);
  } else {
    result = updateConsulta(params);
  }
  if (result.toString() === 'true') {
    if (CONSULTAS.length) {
      actualizarCacheConsultas(Consulta);
    }
    if (!silent) {
      M.toast({
        html: 'Los datos de la persona se han guardado correctamente'
      });
      return true;
    }
  }

}

const createConsulta = async (params) => {
  const data = await fetchData({
    endpoint: api.consultas.create,
    params
  });
  if (data.error) {
    return api.common.errorHandler({
      endpoint: api.consultas.create,
      error: data
    });
  }
  CONSULTAS.push(data);
  navigatorCreator();
  galleryCreator();
  // carouselCreator();
  goTo(CONSULTAS.length - 1);
  // R.mutate('Consulta',{_id: data._id});   
  return true;
}

const updateConsulta = async (params) => {
  const data = await fetchData({
    endpoint: api.consultas.update,
    params
  });
  if (data.error) {
    return api.common.errorHandler({
      endpoint: api.consultas.update,
      error: data
    });
  }
  return true;
}

const getAllPersonas = async () => {
  PERSONAS = [];
  const personas = await fetchData({
    endpoint: api.personas.all
  });
  if (personas.error) {
    api.common.errorHandler({
      endpoint: api.personas.all,
      personas
    });

    return;
  }
  const data = [];
  for (persona of personas) {
    data[`${persona.apellido} ${persona.nombre} (${persona.telefono}. ${persona.email})`] = null;
    PERSONAS[`${persona.apellido} ${persona.nombre} (${persona.telefono}. ${persona.email})`] = persona._id;
  }

  $('input.autocomplete').autocomplete({
    data
  });
}

const openFinderPersonas = async () => {
  await initFinder('personas', '#preloader_modal');

  const modal = M.Modal.getInstance(document.querySelector('#buscadorPersonas'));
  modal.open();
}

const getPersonaById = async (_id) => {
  const params = {
    _id
  };
  const data = await fetchData({
    endpoint: api.personas.get,
    params
  });
  if (data.error) {
    api.common.errorHandler({
      endpoint: api.personas.get,
      data
    });
    return false;
  }
  return data;
}

const toggleDetails = async (prevModel, model) => {
  if (model.persona) {
    navigatorCreator();
    galleryCreator();
    historicoMensajesCreator(model.persona);
    // carouselCreator();
    $('.navigator_wrapper').removeClass('hide');
    if (prevModel.persona !== model.persona) {
      $('#persona_details').prop('src', `/personas/?nav=false&id=${model.persona}`);
      Persona = await getPersonaById(model.persona);
      R.mutate('Mensaje', {
        persona: Persona._id,
        telefono: Persona.telefono,
        email: Persona.email
      });
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
  CONSULTAS = await fetchData({
    endpoint: api.consultas.findBy,
    params: {
      persona: PERSONAS[Consulta.ingreseParaBuscar]
    }
  });
  CONSULTAS = CONSULTAS.map(v => {
    v.fecha = displayDate(v.fecha);
    if (v.fechaAbandonoCompromiso) {
      v.fechaAbandonoCompromiso = displayDate(v.fechaAbandonoCompromiso);
    }
    if (v.fechaAbandonoEfectiva) {
      v.fechaAbandonoEfectiva = displayDate(v.fechaAbandonoEfectiva);
    }
    if (v.fechaProximaConsulta) {
      v.fechaProximaConsulta = displayDate(v.fechaProximaConsulta);
    }
    return v;
  });

  // pagination is the wrapper
  const wrapper = $('.pagination');
  $(wrapper).html('');
  if (!CONSULTAS.length) {
    $(wrapper).html('Cargue una nueva consulta para esta persona');
    return;
  }
  const goToFirst = `<li id = "goToFirst" title = "Primera: ${CONSULTAS[0].fecha}"><a href="#" onClick = "goTo(0)"><i class="material-icons left">first_page</i></a></li>`;
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
    const goTo = `<li class = "${setClass}" id = "goTo${index}" title = "${CONSULTAS[index].fecha}"}><a href="#" ${disableClick ? '' : `onClick = "goTo(${index})"`}>${+index + 1}</a></li>`;
    $(wrapper).append(goTo)
  }
  const goToLast = `<li class = "${disableLast ? 'disabled' : ''}" id = "goToLast" title = "Última: ${CONSULTAS[CONSULTAS.length - 1].fecha}"><a href="#" onClick = "goTo(${CONSULTAS.length - 1})"><i class="material-icons right">last_page</i></a></li>`;
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
  let fechaHelper = data.fecha;
  fechaHelper = displayDate(fechaHelper);
  if (fechaHelper !== "Invalid date") {
    data.fecha = fechaHelper;
  }
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
        window.history.replaceState({}, '', newURL);
        break;
      case 'first':
        newURL = "?";
      case 'add':
        newURL = `${newURL}id=${model._id}`;
        window.history.replaceState({}, '', newURL);
        break;
      case 'edit':
        newURL = location.href.split('?')[1].split(currentId).join(model._id);
        window.history.replaceState({}, '', `?${newURL}`);
        break;
    }
  }
}

const plantillasCreator = async () => {
  if (!PLANTILLAS.length) {
    const data = await fetchData({
      endpoint: api.plantillaMensaje.findBy
    });
    PLANTILLAS = JSON.parse(JSON.stringify(data));
  }
  const wrapper = $('#plantillas.collection');
  for (const index in PLANTILLAS) {
    const plantilla = PLANTILLAS[index]
    wrapper.append(`<li class="collection-item"><div>${plantilla.titulo}<a href="#!" class="secondary-content" onClick = copyPlantilla(${index})><i class="material-icons blue-text">file_copy</i></a></div></li>`);
  }
}

const copyPlantilla = (index) => {
  const texto = eval('`' + PLANTILLAS[index].cuerpo.split('{{').join('${').split('}}').join('}') + '`');
  const tipo = PLANTILLAS[index].usarEn;
  if (tipo === 'ambos') {
    R.mutate('Mensaje', {
      texto
    });
  } else {
    R.mutate('Mensaje', {
      texto,
      tipo
    });
  }
  M.textareaAutoResize($('#texto'));
  return texto;
}

const galleryCreator = async () => {
  if (galleryLoaded) {
    return;
  }
  galleryLoaded = true;
  const wrapper = $(".gallery");
  wrapper.html("");
  const response = await fetch('/assets/campaigns/availableAssets.json');
  const descriptor = await response.json();

  for (const {
      title,
      alt,
      url
    } of descriptor) {
    wrapper.append(`<div class = "col s12 m4 l3 center-align" style = "height:250px;"><h6>${title}<i class = "material-icons" onclick="addToMessage('${url}','${alt}','${title}')">add_photo_alternate</i></h6><img class="materialboxed responsive-img card" data-caption="${alt}" style = "max-height:220px;" src="${url}"></div>`);
  }
  $('.materialboxed').materialbox();
}

const addToMessage = (url, alt, title) => {
  const texto = `${Mensaje.texto}
  ![${alt}](https://${location.host}${url} "${title}")
  `;
  R.mutate('Mensaje', {
    texto
  });
  M.textareaAutoResize($('#texto'));
}

const goToHistory = () => {
  if (Consulta.ingreseParaBuscar === "") {
    M.toast({
      html: "Seleccione una persona para ver sus datos históricos"
    });
    return;
  }
  if (!CONSULTAS.length) {
    M.toast({
      html: "La persona seleccionada no posee consultas aún"
    });
    return;
  }
  window.open(`/historico/?id=${PERSONAS[Consulta.ingreseParaBuscar]}`);
}

const sendMessage = () => {
  if (Mensaje.tipo === 'whatsapp') {
    sendWhatsapp();
  } else {
    sendEmail();
  }
}

const sendEmail = async () => {
  if (!Mensaje.subject) {
    M.toast({
      html: 'Por favor, cargue el asunto del mensaje'
    });
    return;
  }
  if (!Mensaje.texto) {
    M.toast({
      html: 'Por favor, cargue el texto del mensaje'
    });
    return;
  }
  if (!Persona.email) {
    M.toast({
      html: 'La persona seleccionada no posee correo electrónico'
    });
    return;
  }

  let params = {
    to: Persona.email,
    from: `${getCookie('username')} <no.responder@lineastop.com>`,
    html: marked(Mensaje.texto),
    subject: Mensaje.subject,
    replyTo: `${getCookie('email')}`
  };
  let data = await fetchData({
    endpoint: api.email.send,
    params
  });
  if (data.error) {
    return api.common.errorHandler({
      endpoint: api.email.send,
      error: data.error
    });
  }

  params = {
    subject: Mensaje.subject,
    texto: params.html,
    fechaEnvio: normalizeDateTime(moment()),
    cancelado: false,
    enviado: true,
    email: Mensaje.email,
    persona: Mensaje.persona
  }
  data = await fetchData({
    endpoint: api.email.create,
    params
  });
  if (data.error) {
    return api.common.errorHandler({
      endpoint: api.email.create,
      error: data.error
    });
  }
  historicoMensajesCreator(Mensaje.persona, true);
  M.toast({
    html: 'El correo electrónico se ha enviado y registrado satisfactoriamente.'
  });
  R.mutate('Mensaje', defaultMensaje);
}

const sendWhatsapp = async () => {
  if (!Mensaje.texto) {
    M.toast({
      html: 'Por favor, cargue el texto del mensaje'
    });
    return;
  }
  if (!Persona.telefono) {
    M.toast({
      html: 'La persona seleccionada no posee teléfono'
    });
    return;
  }
  let url = `https://api.whatsapp.com/send?phone=54${Persona.telefono}&text=${encodeURIComponent(Mensaje.texto)}`;
  window.open(url);
  params = {
    texto: Mensaje.texto,
    fechaEnvio: normalizeDateTime(moment()),
    cancelado: false,
    enviado: true,
    email: Mensaje.email,
    persona: Mensaje.persona
  }
  const data = await fetchData({
    endpoint: api.whatsapps.create,
    params
  });
  if (data.error) {
    return api.common.errorHandler({
      endpoint: api.whatsapps.create,
      error: data.error
    });
  }
  historicoMensajesCreator(Mensaje.persona, true);
  M.toast({
    html: 'El mensaje de Whatsapp se ha registrado como enviado, asegúrese de finalizar el envío en la pestaña abierta recientemente.'
  });
  R.mutate('Mensaje', defaultMensaje);
}

const sendLater = () => {
  if (Mensaje.tipo === 'email') {
    sendEmailLater();
  } else {
    sendWhatsappLater();
  }
}

const sendEmailLater = async () => {
  if (!Mensaje.subject) {
    M.toast({
      html: 'Por favor, cargue el asunto del mensaje'
    });
    return;
  }
  if (!Mensaje.texto) {
    M.toast({
      html: 'Por favor, cargue el texto del mensaje'
    });
    return;
  }
  if (!Persona.email) {
    M.toast({
      html: 'La persona seleccionada no posee correo electrónico'
    });
    return;
  }
  const params = {
    subject: Mensaje.subject,
    texto: Mensaje.texto,
    fechaEnvio: normalizeDate(Mensaje.fechaEnvio),
    cancelado: false,
    enviado: false,
    email: Mensaje.email,
    persona: Mensaje.persona
  }
  const data = await fetchData({
    endpoint: api.email.create,
    params
  });
  if (data.error) {
    return api.common.errorHandler({
      endpoint: api.email.create,
      error: data.error
    });
  }
  const humanReadableDate = moment(normalizeDateTime(Mensaje.fechaEnvio)).from(moment());
  M.toast({
    html: `Te recordaré enviar este correo electrónico ${humanReadableDate}.`
  });
  R.mutate('Mensaje', defaultMensaje);
}

const sendWhatsappLater = async () => {
  if (!Mensaje.texto) {
    M.toast({
      html: 'Por favor, cargue el texto del mensaje'
    });
    return;
  }
  if (!Persona.telefono) {
    M.toast({
      html: 'La persona seleccionada no posee teléfono'
    });
    return;
  }
  const params = {
    subject: Mensaje.subject,
    texto: Mensaje.texto,
    fechaEnvio: normalizeDate(Mensaje.fechaEnvio),
    cancelado: false,
    enviado: false,
    email: Mensaje.email,
    persona: Mensaje.persona
  }
  const data = await fetchData({
    endpoint: api.whatsapps.create,
    params
  });
  if (data.error) {
    return api.common.errorHandler({
      endpoint: api.whatsapps.create,
      error: data.error
    });
  }
  const humanReadableDate = moment(normalizeDateTime(Mensaje.fechaEnvio)).from(moment());
  M.toast({
    html: `Te recordaré enviar este mensaje de Whatsapp ${humanReadableDate}.`
  });
  R.mutate('Mensaje', defaultMensaje);
}

const actualizarCacheConsultas = (model) => {
  for (const index in CONSULTAS) {
    consulta = CONSULTAS[index];
    if (consulta._id === model._id) {
      CONSULTAS[index] = model;
      return;
    }
  }
}

const historicoMensajesCreator = async (persona, force) => {
  if (!persona) {
    return;
  }
  if (historicoLoaded && !force) {
    return;
  }
  historicoLoaded = true;
  const params = {
    persona
  }

  let whatsapps = await fetchData({
    endpoint: api.whatsapps.findBy,
    params
  });


  let emails = await fetchData({
    endpoint: api.email.findBy,
    params
  });


  // mergear y ordenar por fecha
  let data = [];
  const wrapper = $('#historicoMensajes');
  wrapper.html('');
  if (!whatsapps.error && !emails.error) {
    emails = emails.filter(v => v.enviado);
    whatsapps = whatsapps.filter(v => v.enviado);
    data = whatsapps.concat(emails);
  } else if (!whatsapps.error) {
    whatsapps = whatsapps.filter(v => v.enviado);
    data = whatsapps;
  } else if (!email.error) {
    emails = emails.filter(v => v.enviado);
    data = emails;
  }

  if (!data.length) {
    wrapper.append('<li><div class = "collapsible-header">No se han encontrado mensajes para esta persona.</div></li>');
    historicoLoaded = true;
    return;
  }
  if (data.length > 1) {
    data = data.sort((a, b) => a.fechaEnvio.localeCompare(b.fechaEnvio)).reverse();
  }
  // renderizar
  for (const idx in data) {
    let oldMessage = data[idx];
    if (!oldMessage) {
      continue;
    }
    oldMessage.tipo = oldMessage.subject ? 'email' : 'whatsapp';
    const thumbnail = oldMessage.texto && oldMessage.texto.length > 50 ? oldMessage.texto.substring(0, 49).trim() + '...' : oldMessage.texto;
    wrapper.append(`
      <li>
        <div class="collapsible-header tooltiped" data-tooltip = "${thumbnail}" data-position = "right">
          <i class="material-icons ${oldMessage.tipo === 'email'  ? 'blue-text">email' : 'green-text">call'}</i>
          <span>${oldMessage.tipo === 'email' ? oldMessage.subject : 'Mensaje de Whatsapp'}</span>
          <label>${moment(oldMessage.fechaEnvio).fromNow()}</label>
        </div>
        <div class="collapsible-body">${oldMessage.texto ? marked(oldMessage.texto) : ''}</div>
      </li>`);
  }
  if (data.length) {
    $('.collapsible').collapsible();
    $(".tooltiped").tooltip();
  }
}

const previewMessage = (message) => {
  message = typeof message === 'string' ? message : Mensaje.texto;
  if (!message) {
    M.toast({
      html: 'No se ha ingresado texto en el mensaje.'
    });
    return;
  }
  $('.container.flow-text').html(marked(message));
  $('.container.flow-text > p > img').addClass('responsive-img');
  const modal = M.Modal.getInstance(document.querySelector('#previewModal'));
  modal.open();
}