let Usuario = {
  _id: '',
  name: '',
  email:'',
  password:'',
  correoConfirmado:'',
  bloqueado:'',
  permisos:'2',
};

$(document).ready(() =>{

  $('select').formSelect();  
  
 

  // por usar Materialize
  const modelCallback = () => {
      M.updateTextFields();
      $('select').formSelect();
      M.textareaAutoResize($('textarea'));
      $('.fixed-action-btn').floatingActionButton();
      
      
  };
 

  R.s.add({model: 'Usuario', key: '_id', callback: async ({prevModel, model}) => {
    if (model._id) {
      const data = await fetchData({endpoint: api.users.get, params: {_id: model._id}});
    
      if (data.statusCode === 404) {
        M.toast({html:'No se encontró ningún usuario con la información proporcionada.'});
        R.mutate('Usuario', {_id: ''});
        return;
        
      }

      updateURL(model);
             
      R.mutate('Usuario', data);
    }
  }});

  // Inicialización
  R.init('Usuario');

  const url = new URL(location.href);
  const _id = url.searchParams.get('id');

  if (_id) {
    R.mutate('Usuario', {_id});
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
        window.history.replaceState( {} , 'users/', newURL);
        break;
      case 'edit':
        newURL =  location.href.split('?')[1].split(currentId).join(model._id);
        window.history.replaceState( {} , 'users/', newURL);
        break;
    }
  }
}

/* const savePersonaSilently = () => {
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
    params.nacimiento = moment(params.nacimiento, 'DD/MM/YYYY').toString(); 
  }

  if(params.nacimiento){
    params.primerConsulta = moment(params.primerConsulta, 'DD/MM/YYYY').toString(); 
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
} */