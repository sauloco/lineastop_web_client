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
  cigarrillosDiarios: '0 a 10'
}

$(document).ready(() =>{
  $('select').formSelect();  
  $('.datepicker').datepicker();
  
  // por usar Materialize
  const modelCallback = () => {
      M.updateTextFields();
      $('select').formSelect();
      M.textareaAutoResize($('textarea'));
  };
  
  R.s.add({model: 'Persona', callback: modelCallback})
  R.s.add({model: 'HistoriaTabaquismo', callback: modelCallback})

  // Inicialización
  R.init('Persona');
  R.init('HistoriaTabaquismo');
})

