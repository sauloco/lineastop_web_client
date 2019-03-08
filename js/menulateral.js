$(document).ready(() => {
  $('.sidenav').sidenav();
  iniciarNavBar();
  $('#logout').click(logout);
  $('.tooltipped').tooltip(data=pepe);
  //$('#userTooltip').hover(toast);
})
let pepe='';
const iniciarNavBar = async () => {
  const response = await fetchData({
    endpoint: api.users.me
    
  })
  pepe=response.username;
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
