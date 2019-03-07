$(document).ready(()=>{
  $('.sidenav').sidenav();
  iniciarNavBar();
  collectionsCreator();
  $('#logout').click(logout);
})

const iniciarNavBar = async () => {
  const response = await fetchData({endpoint: api.users.me})
  $('#welcome').html(`Bienvenido ${response.username}`);
}

const logout = () => {
  setCookie({name: 'jwt', value: '', day: 0, force: true});
  validarToken();
}

CONSULTAS = [
    {
      persona: {
        apellido: '',
        nombre: ''
      },
      _id: '',
      fechaProximaConsulta: ''
     },
]
const collectionsCreator = async (params) => {
CONSULTAS = await fetchData({endpoint: api.consultas.findBy, params});
  // collection is the wrapper
const wrapper = $('.collection');
$(wrapper).html('');
 if (!CONSULTAS.length) {
    $(wrapper).html('Cargue una nueva consulta para esta persona');  
  }; 

  for (const index in CONSULTAS) {
  const muestraAContactar = `<li id = "contactarA"><a href="/consultas/?id=:${CONSULTAS[index]._id}" class="collection-item">${CONSULTAS[index].persona.apellido}</a></li>`;
$(wrapper).append(muestraAContactar);
  }  
    
}

