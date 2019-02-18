let DatosPrincipalesConsulta = {
  ingreseParaBuscar: '',
  fechaConsulta: '',
};
let SintomasClinicos = {
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
};

let TratamientoCognitivo = {
  tabaquismoEsEnfermedad: false,
  queEsTripleAdiccion: false,
  cadaAbandonoEsExperiencia: false,
  controlApoyoTelefonico: false,
  dejarDeFumarCammbiaVida: false,
  tratamientoFarmacologicoSiNecesario: false,
};

let TratamientoConductual = {
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
}

let ConductaTerapeutica = {
  derivado: false,
  medicoDerivado: '',
  notificacionAlMedico: '',
  compromisoAbandono: '',
  abandonoEfectivo: '',
  proximaConsulta: '',
  observacionesGenerales: '',

}

$(document).ready(() => {
  $('select').formSelect();
  $('#guardar').click(savePersona);
  initializeDatepicker();
  getAllPersonas();

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
    model: 'DatosPrincipalesConsulta',
    callback: modelCallback
  });
  R.s.add({
    model: 'SintomasClinicos',
    callback: modelCallback
  });
  R.s.add({
    model: 'TratamientoCognitivo',
    callback: modelCallback
  });
  R.s.add({
    model: 'TratamientoConductual',
    callback: modelCallback
  });
  R.s.add({
    model: 'ConductaTerapeutica',
    callback: modelCallback
  });


  R.s.add({
    model: 'DatosPrincipalesConsulta',
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
        R.mutate('DatosPrincipalesConsulta', {
          'fechaConsulta': prevModel.fechaConsulta
        });
        return;
      }

    }
  });

  R.s.add({
    model: 'ConductaTerapeutica',
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
        R.mutate('ConductaTerapeutica', {
          'compromisoAbandono': prevModel.compromisoAbandono
        });
        return;
      }
    }
  });

  R.s.add({
    model: 'ConductaTerapeutica',
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
        R.mutate('ConductaTerapeutica', {
          'abandonoEfectivo': prevModel.abandonoEfectivo
        });
        return;
      }
    }
  });

  R.s.add({
    model: 'ConductaTerapeutica',
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
        R.mutate('ConductaTerapeutica', {
          'proximaConsulta': prevModel.proximaConsulta
        });
        return;
      }
    }
  });

  R.s.add({
    model: 'ConductaTerapeutica',
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
  R.init('DatosPrincipalesConsulta');
  R.init('SintomasClinicos');
  R.init('TratamientoCognitivo');
  R.init('TratamientoConductual');
  R.init('ConductaTerapeutica');

})

const savePersona = () => {
  // TODO: send data to backend
  M.toast({
    html: 'Supongamos que acá se mandó a guardar la data.'
  });
}

const getAllPersonas = async () => {
  const personas = await fetchData({endpoint: api.personas.all});
  data = [];
  for (persona of personas) {
    data[`${persona.apellido} ${persona.nombre} (${persona.telefono}. ${persona.email})`] = null;
  }
  
  $('input.autocomplete').autocomplete({data});
}