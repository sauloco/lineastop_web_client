let DatosPrincipalesConsulta = {
  ingreseParaBuscar: 'Gallo',
  fechaConsulta: '',
};
let SintomasClinicos = {
  tos: false,
  expectoracion: false,
  doloresCalambres:false,
  dolorPrecordial:false,
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

$(document).ready(() =>{
  $('select').formSelect();  
  $('.datepicker').datepicker();
  $('#guardar').click(savePersona);

  
  // por usar Materialize
  const modelCallback = () => {
      M.updateTextFields();
      $('select').formSelect();
      M.textareaAutoResize($('textarea'));
      $('.sidenav').sidenav();
      $('.tooltipped').tooltip();
  $('input.autocomplete').autocomplete({
    data: {
        "Apple": null,
        "Microsoft": null,
        "Google": 'https://placehold.it/250x250'
      },
    });
  $('.fixed-action-btn').floatingActionButton();
    };
  



  R.s.add({model: 'DatosPrincipalesConsulta', callback: modelCallback});
  R.s.add({model: 'SintomasClinicos', callback: modelCallback});
  R.s.add({model: 'TratamientoCognitivo', callback: modelCallback});
  R.s.add({model: 'TratamientoConductual', callback: modelCallback});
  R.s.add({model: 'ConductaTerapeutica', callback: modelCallback});

    
  R.s.add({model: 'DatosPrincipalesConsulta', key: 'fechaConsulta', callback: ({prevModel, model}) => {
    const hoy = moment();    
      if (moment(model.fechaConsulta) .isAfter (moment(hoy))) {
        M.toast({html: 'Esta fecha deber ser anterior a la fecha actual.'})
        return;
      }
    
  }});
  
  R.s.add({model: 'ConductaTerapeutica', key: 'compromisoAbandono', callback: ({prevModel, model}) => {
    const hoy = moment();
      if (moment(model.compromisoAbandono) .isBefore (moment(hoy))){
        M.toast({html: 'La fecha de compromiso no puede ser anterior a la fecha actual.'})
        return;
      }
  }});
  
  R.s.add({model: 'ConductaTerapeutica', key: 'abandonoEfectivo', callback: ({prevModel, model}) => {
    const hoy = moment();
      if (moment(model.abandonoEfectivo) .isAfter (moment(hoy))){
        M.toast({html: 'La fecha de Abandono no puede ser anterior a la fecha actual.'})
        return;
      }
  }});
  
  R.s.add({model: 'ConductaTerapeutica', key: 'proximaConsulta', callback: ({prevModel, model}) => {
    const hoy = moment();
      if (moment(model.proximaConsulta) .isBefore (moment(hoy))){
        M.toast({html: 'La fecha de Proxima Consulta no puede ser anterior a la fecha actual.'})
        return;
      }
  }});

  R.s.add({model: 'ConductaTerapeutica', key: 'derivado', callback: ({prevModel, model}) => {
    if (model.derivado) {
      $('#medicoDerivadoDetails').removeClass('hide');
      $('#notificacionAlMedicoDetails').removeClass('hide');

    } else {
      $('#medicoDerivadoDetails').addClass('hide');
      $('#notificacionAlMedicoDetails').addClass('hide');

    }
  }});


  // Inicialización
  R.init('DatosPrincipalesConsulta');
  R.init('SintomasClinicos');
  R.init('TratamientoCognitivo');
  R.init('TratamientoConductual');
  R.init('ConductaTerapeutica');

})


const savePersona = () => {
    // TODO: send data to backend
    M.toast({html: 'Supongamos que acá se mandó a guardar la data.'});
  }