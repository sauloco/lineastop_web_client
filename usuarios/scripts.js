let Usuario = {
  _id: '',
  username: '',
  email:'',
  confirmed:'',
  blocked:'',
  role:''
};

$(document).ready(() =>{

  $('select').formSelect();  
  $('#guardar').click(actualizarUsuarios);

 

  // por usar Materialize
  const modelCallback = () => {
      M.updateTextFields();
      $('.fixed-action-btn').floatingActionButton();
      
  };
 
  R.s.add({model: 'Usuario', callback: modelCallback});

  R.s.add({model: 'Usuario', key: '_id', callback: async ({prevModel, model}) => {
    if (model._id) {
      const data = await fetchData({endpoint: api.users.get, params: {_id: model._id}});
    
      if (data.statusCode === 404) {
        M.toast({html:'No se encontró ningún usuario con la información proporcionada.'});
        R.mutate('Usuario', {_id: ''});
        return;
        
      }

      updateURL(model);
      if (data.role) {
        data.role = data.role._id;
      } else {
        data.role = "5c8f00cbda246c0017884e15";
      }

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

const actualizarUsuarios = async () => {
  const params = R.clone(Usuario);
  delete params['email'];
  updatePermisos(params);
}

const updatePermisos = async (params) => {
  const data = await fetchData({endpoint: api.users.update, params});
  if(data.error){
      return api.common.errorHandler({endpoint: api.users.update, error: data});
  }
  M.toast({html: 'Los datos fueron actualizados correctamente'});
  return true;
}
