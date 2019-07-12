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
  sexo: 'm',
  telefonoFijo: '',
  diabetes: false,
  hta: false,
  epoc: false,
  sobrepeso: false,
  obesidad: false,
  internaciones: false
};

let defaultPersona = R.clone(Persona);

$(document).ready(() =>{
  
  $('#guardar').click(savePersonaWithToast);
  $('#delete').click(deletePersonaWithToast);
  initializeDatepicker();
  initializeDatepicker({
    yearRange: [1930, 2029]
  }, '#nacimiento');
  $('select').formSelect();
  $('.fixed-action-btn').floatingActionButton();
  // por usar Materialize
  const modelCallback = () => {
    M.updateTextFields();
    $('select').formSelect();
    M.textareaAutoResize($('textarea'));
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

      // updateURL(model);
      
      if(data.nacimiento){
        data.nacimiento = displayDate(data.nacimiento); // moment(new Date(data.nacimiento)).format('DD/MM/YYYY');
      }
      if(data.primerConsulta){
        data.primerConsulta = displayDate(data.primerConsulta); // moment(new Date(data.primerConsulta)).format('DD/MM/YYYY');
      }       
      R.mutate('Persona', data);
    }
    updateURL(model)
    
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
  if (!model._id) {
    window.history.replaceState( {} , 'personas/', '/personas/');
    return;
  }
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

const delay = async (ms) => {
  return function(){
		return new Promise(function(resolve, reject){
			setTimeout(function(){
				resolve();
			}, ms)
		});
	};
}

const deletePersonaWithToast = async () => {
  if (!Persona._id) {
    M.toast({html:'No hay ninguna persona cargada como para ser borrada.'});
    return false;
  }
  const params = {persona: Persona._id};
  const data = await fetchData({endpoint: api.consultas.findBy, params});
  if (data.error) {
    return api.common.errorHandler({endpoint: api.consultas.findBy, error: data});
  }
  let message = `¿Está seguro que desea eliminar los datos de ${Persona.nombre} ${Persona.apellido}?`;
  if (data.length) {
    const singular = ` Se ha encontrado 1 consulta asociada a esta persona, será eliminada también si confirma la operación.`;
    message += data.length === 1 ? singular : ` Se han encontrado ${data.length} consultas asociadas a esta persona, serán eliminadas también si confirma la operación.`;
  }
  if (confirm(message)) {
    let errorIds = [];
    for (consulta of data) {
      const data2 = await deleteConsulta(consulta._id);
      if (!data2.toString() === 'true') {
        errorIds.push(data._id);
      }
    }
    if (errorIds.length) {
      M.toast({html: `Se produjo un error eliminando las consultas de ${Persona.nombre} ${Persona.apellido}. Consulte con el administrador del sistema.`});
      return false;
    }
    const data3 = await deletePersona(Persona._id);
    if (!data3.toString() === 'true') {
      M.toast({html: `Se produjo un error eliminando los datos personales de ${Persona.nombre} ${Persona.apellido}. Consulte con el administrador del sistema.`});
      return false;
    }
    M.toast({html: `Los datos de la persona han sido eliminados correctamente.`});
    R.mutate('Persona', defaultPersona);
    return true;
  }
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
    result = await updatePersona(params);
  } else {
    initPreloader('#preloader_modal');
    delete params['_id'];
    result = await createPersona(params);
    stopPreloader();
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

const deletePersona = async (_id) => {
  const params = {_id}
  const data = await fetchData({endpoint: api.personas.delete, params});
  if (data.error) {
    return api.common.errorHandler({endpoint: api.personas.delete, error: data});
  }
  return true;
}

const deleteConsulta = async (_id) => {
  const params = {_id}
  const data = await fetchData({endpoint: api.consultas.delete, params});
  if (data.error) {
    return api.common.errorHandler({endpoint: api.consultas.delete, error: data});
  }
  return true;
}

