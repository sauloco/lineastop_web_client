$(document).ready(() => {
  $('.sidenav').sidenav();
  iniciarNavBar();
  $('#logout').click(logout);
  $('.tooltipped').tooltip();
  //$('#userTooltip').hover(toast);
})
let pepe='';
const iniciarNavBar = async () => {
  const response = await fetchData({
    endpoint: api.users.me
    
  })
  $('#userTooltip').attr('data-tooltip', response.username);
}
/* const toast = () =>{
  M.toast({html: `${pepe}`});

} */
const logout = () => {
  setCookie({
    name: 'jwt',
    value: '',
    day: 0,
    force: true
  });
  validarToken();
}
