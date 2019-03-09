$(document).ready(() => {
  $('.sidenav').sidenav();
  iniciarNavBar();
  $('#logout').click(logout);
  $('.tooltipped').tooltip();
})
let pepe = '';
const iniciarNavBar = async () => {
  const response = await fetchData({
    endpoint: api.users.me

  })
  $('#userTooltip').attr('data-tooltip', response.username);
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