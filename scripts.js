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

const collectionsCreator = async () => {
CONSULTAS = await fetchData({endpoint: api.consultas.findBy, params: {persona: PERSONAS[Consulta.ingreseParaBuscar]}});
  // pagination is the wrapper
const wrapper = $('.collections');
$(wrapper).html('');
 if (!CONSULTAS.length) {
    $(wrapper).html('Cargue una nueva consulta para esta persona');  
  } 

//<a href="#! aca pongo la id para mandarla a la pagina de consultas" class="collection-item">mostrar aca objeto persona</a> */