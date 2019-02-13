let Persona = {
  _id: '',
  apellido: '',
  nombre: '',
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
  $('#guardar').click(savePersonaWithToast);
  initializeDatepicker();

  // por usar Materialize
  const modelCallback = () => {
      M.updateTextFields();
      $('select').formSelect();
      M.textareaAutoResize($('textarea'));
      $('.fixed-action-btn').floatingActionButton();

      // savePersonaSilently();

  };
 


  R.s.add({model: 'Persona', callback: modelCallback});
  R.s.add({model: 'HistoriaTabaquismo', callback: modelCallback});

  R.s.add({model: 'Persona', key: 'nacimiento', callback: ({prevModel, model}) => {
    let hoy = moment();
    let unit = 'years';
    
    let difference = moment(model.nacimiento).isValid() && moment(hoy).isValid()?
      moment(hoy).diff(model.nacimiento, unit) : '';
      if (moment(model.nacimiento) .isAfter (moment(hoy))) {
        M.toast({html: 'La fecha de nacimiento deber ser anterior a la fecha actual.'});
        R.mutate('Persona', {nacimiento: prevModel.nacimiento});
        return;
      }
      if (moment(model.nacimiento) .isBefore (moment(hoy))&& difference<=18){
        M.toast({html: 'El paciente debe ser mayor de edad, verifique la fecha de nacimiento.'})
        R.mutate('Persona', {nacimiento: prevModel.nacimiento});
        return;
      
      };
      R.mutate('Persona', {edad: `${difference} año${difference === 1 ? '' : 's'}`})
    
  }});
  
  R.s.add({model: 'Persona', key: 'primerConsulta', callback: ({prevModel, model}) => {
    const hoy = moment();
    let unit = 'years';
    let difference = moment(model.primerConsulta).isValid() && moment(hoy).isValid() ?
      moment(hoy).diff(model.primerConsulta, unit) : '';
      if (moment(model.primerConsulta) .isAfter (moment(hoy)) || difference<0){
        M.toast({html: 'La fecha de Primera consulta no puede ser posterior a la fecha actual.'})
        return;
      }
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

  R.s.add({model: 'Persona', key: '_id', callback: async ({prevModel, model}) => {
    const data = await fetchData({endpoint: api.personas.get, params: {_id: model._id}});
    R.mutate('Persona', data);
  }});

  // Inicialización
  R.init('Persona');
  R.init('HistoriaTabaquismo');

  const url = new URL(location.href);
  const _id = url.searchParams.get('id');

  if (_id) {
    R.mutate('Persona', {_id});
  }

})

const savePersonaSilently = () => {
  savePersona(true);
}

const savePersonaWithToast = () => {
  savePersona(false);
}

const savePersona = async (silent) => {
  const params = R.clone(Persona);
  if (Persona._id) {
    updatePersona(params);
  } else {
    delete params['_id'];
    createPersona(params);
  }
/*   if (!silent) {
    M.toast({html:'Los datos de la persona se han guardado correctamente'});
  } */
}

const createPersona = async (params) => {
  const data = await fetchData({endpoint: api.personas.create, params});
  if(data.error){
      return api.common.errorHandler({endpoint: api.personas.create, error: data});
      
  }
}

const updatePersona = async (params) => {
  const data = await fetchData({endpoint: api.personas.update, params});
  if(data.error){
      return api.common.errorHandler({endpoint: api.personas.update, error: data});
  }
}