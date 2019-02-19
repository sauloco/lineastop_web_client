let PERSONAS = [];

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
        return;
      }

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