$(document).ready(() => {
  $('.sidenav').sidenav();
  iniciarNavBar();
  $('#logout').click(logout);
  $('.tooltipped').tooltip();
})
const iniciarNavBar = async () => {
  const response = await fetchData({
    endpoint: api.users.me
  });
  $('#userTooltip').attr('data-tooltip', response.username);
}

const logout = () => {
  setCookie({
    name: 'jwt',
    value: '',
    day: 0,
    force: true
  });
  setCookie({
    name: 'username',
    value: '',
    day: 0,
    force: true
  });
  setCookie({
    name: 'email',
    value: '',
    day: 0,
    force: true
  });
  setCookie({
    name: 'id',
    value: '',
    day: 0,
    force: true
  });
  validarToken();
}