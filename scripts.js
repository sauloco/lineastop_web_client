$(document).ready(()=>{
  iniciarNavBar();
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