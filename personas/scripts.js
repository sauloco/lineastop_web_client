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
  sexo: '',
  telefonoFijo: ''
};

$(document).ready(() =>{

  // M.FormSelect.init(document.querySelectorAll('select'), {});

  
  $('#guardar').click(savePersonaWithToast);
  initializeDatepicker();
  initializeDatepicker({
    yearRange: [1930, 2029]
  }, '#nacimiento');

  // por usar Materialize
  const modelCallback = () => {
    M.updateTextFields();
    $('select').formSelect();
    M.textareaAutoResize($('textarea'));
    $('.fixed-action-btn').floatingActionButton();
    moment.locale('es');
    if (Persona.apellido && Persona.nombre) {
      savePersonaSilently();
    }
  };
 


  R.s.add({model: 'Persona', callback: modelCallback}); 

  R.s.add({model: 'Persona', key: 'nacimiento', callback: ({prevModel, model}) => {
    if (!model.nacimiento) {
      return;
    }
    let hoy = moment();
      if (moment(model.nacimiento, DATE_FORMAT_ES).isAfter(moment(hoy))) {
        M.toast({html: 'La fecha de nacimiento deber ser anterior a la fecha actual.'});
        R.mutate('Persona', {nacimiento: prevModel.nacimiento});
        return;
      }
      R.mutate('Persona', {edad: `${moment(model.nacimiento, DATE_FORMAT_ES).fromNow(true)}`})
    }});
  
  R.s.add({model: 'Persona', key: 'primerConsulta', callback: ({prevModel, model}) => {
    if (!model.primerConsulta) {
      return;
    }
    const hoy = moment();
    if (moment(model.primerConsulta, DATE_FORMAT_ES).isAfter(moment(hoy))){
      M.toast({html: 'La fecha de primera consulta no puede ser posterior a la fecha actual.'})
      return;
    }
    R.mutate('Persona', {hace: `${moment(model.primerConsulta, DATE_FORMAT_ES).fromNow(true)}`})
  }});
  
  const calculaImc = (pesoKg, alturaCm) => { 
    return pesoKg / Math.pow(alturaCm/100,2);
  }
  
  const validaPesoAltura = ({prevModel, model}) => {
    if (model.pesoKg && model.alturaCm){
      const imc = Math.round(calculaImc(model.pesoKg, model.alturaCm)*100)/100; 
      R.mutate('Persona', {imc}); 
    }
  }

  R.s.add({model: 'Persona', key: 'pesoKg', callback: validaPesoAltura});

  R.s.add({model: 'Persona', key: 'alturaCm', callback: validaPesoAltura});
 
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
      
      if(data.nacimiento){
        data.nacimiento = displayDate(data.nacimiento); // moment(new Date(data.nacimiento)).format('DD/MM/YYYY');
      }
      if(data.primerConsulta){
        data.primerConsulta = displayDate(data.primerConsulta); // moment(new Date(data.primerConsulta)).format('DD/MM/YYYY');
      }       
      R.mutate('Persona', data);
    }
  }});

  // Inicialización
  R.init('Persona');

  const url = new URL(location.href);
  const _id = url.searchParams.get('id');
  const nav = url.searchParams.get('nav');

  if (nav === 'false') {
    $('nav').addClass('hide');
    $('.fixed-action-btn').addClass('hide');
    $('.container').removeClass('container');

  }

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
        window.history.replaceState( {} , 'personas/', `?${newURL}`);
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
  
  if(params.nacimiento){
    params.nacimiento = normalizeDate(params.nacimiento);
  }

  if(params.primerConsulta){
    params.primerConsulta = normalizeDate(params.primerConsulta);
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