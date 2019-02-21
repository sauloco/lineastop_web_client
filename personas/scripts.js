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
  cigarrillosDiarios: '1 a 10',
  edadInicio: '15 o menos',
  marca: '',
  finSemana: false,
  alimentacionSaludable: false,
  actividadFisica: false,
  abandonoPrevio: false,
  abandonoDuracion: 'no',
  tratamientoRecibido: 'ninguno',
  motivoRecaida:'',
  hogarFuma: false,
  hogarFumaDonde:'',
  trabajoFuma: false,
  padreFuma: false, 
  convivienteFuma: false,
  convivienteQuienFuma:'', 
  dependenciaFagestrom:'moderado',
  motivacionRichmond:'moderado', 
  cuandoFumaMas:'',
  asociaCon: '', 
  observacion:'', 
  imc:'',
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
      if (Persona.apellido && Persona.nombre) {
        savePersonaSilently();
      }
      
      
  };
 


  R.s.add({model: 'Persona', callback: modelCallback});

  R.s.add({model: 'Persona', key: 'nacimiento', callback: ({prevModel, model}) => {
    let hoy = moment();
    let unit = 'years';
    //moment(model.nacimiento).format('DD MM YYYY'); permite guardar pero no muestra bien la fecha
    //model.nacimiento = date.parse(model.nacimiento); no funciona
    //model.nacimiento = new.date(model.nacimiento); no funciona
    //model.nacimiento = parseInt(model.nacimiento); no funciona
    //model.nacimiento = parse(model.nacimiento); no funciona
    model.nacimiento = parseFloat(model.nacimiento); //permite guardar pero no muestra bien la fecha


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
  
  R.s.add({model: 'Persona', key: 'alturaCm', callback: ({prevModel, model}) => {
    let cuadrado = 0;
    let imcv = 0;
    if ((model.pesoKg) & (model.alturaCm)){
      cuadrado = Math.pow(model.alturaCm,2);
      imcv = (model.pesoKg) / (cuadrado/10000);
      console.log (imcv);
      return;
      }
      R.mutate('Persona', {imc: `${imcv}`});
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

  R.s.add({model: 'Persona', key: 'abandonoPrevio', callback: ({prevModel, model}) => {
    if (model.abandonoPrevio) {
      $('#abandonoPrevioDetails').removeClass('hide');
    } else {
      $('#abandonoPrevioDetails').addClass('hide');
    }
  }});

  R.s.add({model: 'Persona', key: 'hogarFuma', callback: ({prevModel, model}) => {
    if (model.enHogarSeFuma) {
      $('#hogarFumaDonde').removeClass('hide');
    } else {
      $('#hogarFumaDonde').addClass('hide');
    }
  }});
  
  R.s.add({model: 'Persona', key: 'convivienteFuma', callback: ({prevModel, model}) => {
    if (model.convivienteFuma) {
      $('#convivienteQuienFuma').removeClass('hide');
    } else {
      $('#convivienteQuienFuma').addClass('hide');
    }
  }});
  
  R.s.add({model: 'Persona', key: '_id', callback: async ({prevModel, model}) => {
    if (model._id) {
      const data = await fetchData({endpoint: api.personas.get, params: {_id: model._id}});
    
      if (data.statusCode === 404) {
        M.toast({html:'No se encontró ninguna persona con la información proporcionada.'});
        R.mutate('Persona', {_id: ''});
        return;
      }

      updateURL(model);
      
      R.mutate('Persona', data);
    }
  }});

  // Inicialización
  R.init('Persona');

  const url = new URL(location.href);
  const _id = url.searchParams.get('id');

  if (_id) {
    R.mutate('Persona', {_id});
  }

})


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
        window.history.replaceState( {} , 'personas/', newURL);
        break;
      case 'edit':
        newURL =  location.href.split('?')[1].split(currentId).join(model._id);
        window.history.replaceState( {} , 'personas/', newURL);
        break;
    }
  }
}

const savePersonaSilently = () => {
  return savePersona(true);
}

const savePersonaWithToast = () => {
  return savePersona(false);
}

const savePersona = async (silent) => {
  
  const params = R.clone(Persona);
  if (params.pesoKg) {
    params.pesoKg = parseFloat(params.pesoKg);
  } else {
    params.pesoKg = 0;
  }
  

  let result = false;
  if (Persona._id) {
    result = updatePersona(params);
  } else {
    delete params['_id'];
    result = createPersona(params);
  }
  if (result.toString() === 'true') {
    if (!silent) {
      M.toast({html:'Los datos de la persona se han guardado correctamente'});
      return true;
    }
  }
  
}

const createPersona = async (params) => {
  const data = await fetchData({endpoint: api.personas.create, params});
  if(data.error){
      return api.common.errorHandler({endpoint: api.personas.create, error: data});
  }
  R.mutate('Persona',{_id: data._id});   
  return true;
}

const updatePersona = async (params) => {
  const data = await fetchData({endpoint: api.personas.update, params});
  if(data.error){
      return api.common.errorHandler({endpoint: api.personas.update, error: data});
  }
  return true;
}