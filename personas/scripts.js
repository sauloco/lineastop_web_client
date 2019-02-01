let Persona = {
  apellido: 'Gallo',
  nombre: 'Norma',
  telefono: '',
  email: '',
  primerConsulta: '',
  hace:'',
  nacimiento: '',
  edad:'',
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
  enHogarSeFuma: false,
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

  R.s.add({model: 'Persona', key: 'nacimiento', callback: ({prevModel, model}) => {
    const hoy = moment();
    let unit = 'years';
    let difference = moment(model.nacimiento).isValid() && moment(hoy).isValid() ?
      moment(hoy).diff(model.nacimiento, unit) : '';
      R.mutate('Persona', {edad: `${difference} año${difference === 1 ? '' : 's'}`});
  }});

  R.s.add({model: 'Persona', key: 'primerConsulta', callback: ({prevModel, model}) => {
    const hoy = moment();
    let unit = 'years';
    let difference = moment(model.primerConsulta).isValid() && moment(hoy).isValid() ?
      moment(hoy).diff(model.primerConsulta, unit) : '';
      R.mutate('Persona', {hace: `${difference} año${difference === 1 ? '' : 's'}`});
  }});
  
  R.s.add({model: 'Persona', key: 'antecedentesPatologicos', callback: ({prevModel, model}) => {
    if (model.antecedentesPatologicos) {
      $('#antecedentesPatologicosDetails').removeClass('hide');
    } else {
      $('#antecedentesPatologicosDetails').addClass('hide');
    }
  }});

  R.s.add({model: 'Persona', key: 'recibeMedicamentos', callback: ({prevModel, model}) => {
    if (model.recibeMedicamentos) {
      $('#recibeMedicamentosDetails').removeClass('hide');
    } else {
      $('#recibeMedicamentosDetails').addClass('hide');
    }
  }});

  R.s.add({model: 'HistoriaTabaquismo', key: 'abandonoPrevio', callback: ({prevModel, model}) => {
    if (model.abandonoPrevio) {
      $('#abandonoPrevioDetails').removeClass('hide');
    } else {
      $('#abandonoPrevioDetails').addClass('hide');
    }
  }});

  R.s.add({model: 'HistoriaTabaquismo', key: 'enHogarSeFuma', callback: ({prevModel, model}) => {
    if (model.enHogarSeFuma) {
      $('#enHogarSeFumaDonde').removeClass('hide');
    } else {
      $('#enHogarSeFumaDonde').addClass('hide');
    }
  }});
  
  R.s.add({model: 'HistoriaTabaquismo', key: 'convivienteFuma', callback: ({prevModel, model}) => {
    if (model.convivienteFuma) {
      $('#convivienteFumaQuien').removeClass('hide');
    } else {
      $('#convivienteFumaQuien').addClass('hide');
    }
  }});

  // Inicialización
  R.init('Persona');
  R.init('HistoriaTabaquismo');
})

