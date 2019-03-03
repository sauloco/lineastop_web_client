let PERSONAS = [];
let CONSULTAS = [
  {
    _id: 123456789,
    ingreseParaBuscar: 'Perez Juan (22458877. jperez@gmail.com)',
    persona: '5c13c44ea003c6123488e471',
    fechaConsulta: '01/01/2019'
  },
  {
    _id: 321654987,
    ingreseParaBuscar: 'Perez Juan (22458877. jperez@gmail.com)',
    persona: '5c13c44ea003c6123488e471',
    fechaConsulta: '01/02/2019'
  },
  {
    _id: 987654321,
    ingreseParaBuscar: 'Perez Juan (22458877. jperez@gmail.com)',
    persona: '5c13c44ea003c6123488e471',
    fechaConsulta: '01/03/2019'
  },
];

let Consulta = {
  _id: '',
  ingreseParaBuscar: '',
  fechaConsulta: '',
  tos: false,
  expectoracion: false,
  doloresCalambres: false,
  dolorPrecordial: false,
  dificultadRespiratoria: false,
  sueño: false,
  piel: false,
  olfato: false,
  dientes: false,
  gusto: false,
  clausicacion: false,
  problemasPeso: false,
  tabaquismoEsEnfermedad: false,
  queEsTripleAdiccion: false,
  cadaAbandonoEsExperiencia: false,
  controlApoyoTelefonico: false,
  dejarDeFumarCammbiaVida: false,
  tratamientoFarmacologicoSiNecesario: false,
  actividadManual: false,
  tiempoLibre: false,
  carteleria: false,
  comprometerse: false,
  corteCigarrillos: false,
  desayuno: false,
  actividadFisica: false,
  agua: false,
  chiclesSinAzucar: false,
  zanahoriaManzana: false,
  autoSinTabaco: false,
  casaSinTabaco: false,
  alimentacion: false,
  cepilladoDientes: false,
  baños: false,
  reunionesFumadores: false,
  cambioMarcas: false,
  otros: '',
  derivado: false,
  medicoDerivado: '',
  notificacionAlMedico: '',
  compromisoAbandono: '',
  abandonoEfectivo: '',
  proximaConsulta: '',
  observacionesGenerales: '',
  persona: ''
}

$(document).ready(() => {
  $('select').formSelect();
  $('#guardar').click(saveConsulta);
  initializeDatepicker();
  getAllPersonas();
  $('#finderLauncherPersonas').click(openFinderPersonas);
  $('.fixed-action-btn').floatingActionButton();

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

  R.s.add({
    model: 'Consulta',
    callback: modelCallback
  });

  R.s.add({
    model: 'Consulta',
    key: 'ingreseParaBuscar',
    callback: ({prevModel, model}) => {
      if (model.ingreseParaBuscar) {
        R.mutate('Consulta', {'persona': PERSONAS[model.ingreseParaBuscar]});
      }
      toggleDetails(model);
    }
  })

  R.s.add({
    model: 'Consulta',
    key: 'fechaConsulta',
    callback: ({
      prevModel,
      model
    }) => {
      const hoy = moment();
      if (moment(model.fechaConsulta, DATE_FORMAT_ES).isAfter(moment(hoy))) {
        M.toast({
          html: 'La fecha de la consulta no puede ser futura.'
        });
        R.mutate('Consulta', {
          'fechaConsulta': prevModel.fechaConsulta
        });
      }
      toggleDetails(model);
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

  // Inicialización
  R.init('Consulta');

})

const saveConsulta = () => {
  // TODO: send data to backend
  M.toast({
    html: 'Supongamos que acá se mandó a guardar la data.'
  });
}

const getAllPersonas = async () => {
  const personas = await fetchData({endpoint: api.personas.all});
  data = [];
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

const toggleDetails = ({persona, fechaConsulta}) => {
  if (persona) {
    navigatorCreator(persona);
    $('.navigator_wrapper').removeClass('hide');
    if (fechaConsulta) {
      $('.wrapper').removeClass('hide');
    } else {
      $('.wrapper').addClass('hide');
    }
  } else {
    $('.wrapper').addClass('hide');
    $('.navigator_wrapper').addClass('hide');
  }
}

const navigatorCreator = async (persona) => {
  // const CONSULTAS = await fetchData({endpoint: api.consulta.findBy, });
  // pagination is the wrapper
  const wrapper = $('.pagination');
  $(wrapper).html('');
  const goToFirst = `<li id = "goToFirst" class = "tooltipped" data-tooltip="${CONSULTAS[0].fechaConsulta}" data-position="bottom"><a href="" onClick = "goTo(0)"><i class="material-icons">chevron_left</i></a></li>`;
  $(wrapper).append(goToFirst)
  for (index in CONSULTAS) {
    const goTo = `<li class = "tooltipped" data-tooltip="${CONSULTAS[index].fechaConsulta}" data-position="bottom" id = "goTo${index}"><a href="" onClick = "goTo(${index})">${+index+1}</a></li>`;
    $(wrapper).append(goTo)
  }
  const goToLast = `<li class = "tooltipped" data-tooltip="${CONSULTAS[CONSULTAS.length - 1].fechaConsulta}" data-position="bottom" id = "goToLast"><a href="" onClick = "goTo(${CONSULTAS.length - 1})"><i class="material-icons">chevron_right</i></a></li>`;
  $(wrapper).append(goToLast)

}

const goTo = (index) => {
  R.mutate('Consulta', CONSULTAS[index]);
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
  if (model._id !== currentId) {
    switch (mode) {
      case 'first':
        newURL = "?";
      case 'add':
        newURL = `${newURL}id=${model._id}`;
        window.history.replaceState( {} , 'consultas/', newURL);
        break;
      case 'edit':
        newURL =  location.href.split('?')[1].split(currentId).join(model._id);
        window.history.replaceState( {} , 'consultas/', `?${newURL}`);
        break;
    }
  }
}