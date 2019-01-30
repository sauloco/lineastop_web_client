let Persona = {
  apellido: 'Gallo',
  nombre: 'Norma',
  telefono: '',
  email: '',
  primerConsulta: '',
  nacimiento: '',
  nombreCalleBarrio: '',
  numeroCalleBarrio: '',
  numeroPisoDepto: '',
  ciudad: '',
  provincia: '',
  pesoKg: '',
  alturaCm: '',
  antecedentesPatologicos: false,
  descripcionAntecedentesPatologicos: '',
  recibeMedicamentos: false,
  descripcionRecibeMedicamentos: '',
};

let HistoriaTabaquismo = {
  cigarrillosDiarios: '0 a 10',
  edadInicio: '16 a 20',
  marca: '',
  finDeSemana: false,
  alimentacionSaludable: false,
  actividadFisica: false,
  abandonoPrevio: false,
  duracionDelAbandono: '7 a 12',
  tratamientoRecibido: 'ninguno',
  recaida:'',
  enhogarsefuma: false,
  quien:'',
  enTrabajoSeFuma: false,
  padreOMadreFuman: false,
  convivienteFuma: false,
  donde:'',
  dependencia:'moderado',
  motivacion:'moderado',
  cuandoFumaMas:'',
  loAsociaCon: '',
  observacionesHistoriaTabaquismo:'',
};

$(document).ready(() =>{
  $('select').formSelect();  
  $('.datepicker').datepicker();
  
  // por usar Materialize
  const modelCallback = () => {
      M.updateTextFields();
      $('select').formSelect();
      M.textareaAutoResize($('textarea'));
  };
  
  R.s.add({model: 'Persona', callback: modelCallback});
  R.s.add({model: 'HistoriaTabaquismo', callback: modelCallback});

  R.s.add({model: 'HistoriaTabaquismo', key: 'abandonoPrevio', callback: ({prevModel, model}) => {
    if (model.abandonoPrevio) {
      $('#abandonoPrevioDetails').removeClass('hide');
    } else {
      $('#abandonoPrevioDetails').addClass('hide');
    }
  }});

  // Inicialización
  R.init('Persona');
  R.init('HistoriaTabaquismo');
})

