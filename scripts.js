$(document).ready(() => {
  $('.tooltipped').tooltip();
  $('.sidenav').sidenav();
  iniciarNavBar();
  collectionsCreator();
  $('#logout').click(logout);
})

const iniciarNavBar = async () => {
  const response = await fetchData({
    endpoint: api.users.me
  })
  //$('#welcome').html(`Bienvenido ${response.username}`);
}

const logout = () => {
  setCookie({
    name: 'jwt',
    value: '',
    day: 0,
    force: true
  });
  validarToken();
}

CONSULTAS = [{
    persona: {
      apellido: 'Fuentes',
      nombre: 'Pancho'
    },
    _id: '5c7c11a62ce9980017f2617d',
    fechaProximaConsulta: '02/04/2019'
  },
  {
    persona: {
      apellido: 'Tirao',
      nombre: 'Cacho'
    },
    _id: '0987654321',
    fechaProximaConsulta: '04/06/2019'
  },
  {
    persona: {
      apellido: 'Mollo',
      nombre: 'Ricardo'
    },
    _id: '1234509876',
    fechaProximaConsulta: '17/03/2019'
  },
]
const collectionsCreator = async (params) => {
  //CONSULTAS = await fetchData({endpoint: api.consultas.findBy, params});
  // collection is the wrapper
  const wrapper = $('.collection');
  $(wrapper).html('');
  if (!CONSULTAS.length) {
    $(wrapper).html('Cargue una nueva consulta para esta persona');
  };

  for (const index in CONSULTAS) {
    const muestraAContactar = `<li id = "contactarA"><a href="/consultas/?id=${CONSULTAS[index]._id}" class="collection-item">${CONSULTAS[index].persona.apellido} ${CONSULTAS[index].persona.nombre}</a></li>`;
    $(wrapper).append(muestraAContactar);
  }

}