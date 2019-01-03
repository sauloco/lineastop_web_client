const URL_BASE = ['http://127.0.0.1:5500/', 'http://localhost:5500/'];

$(document).ready(() => {
    validarToken();
})


const validarToken = (token) => {
  token = token || getCookie('jwt') || '';
  if (!token) {
    if(location.href.indexOf('login') < 0) {
        location.href = '/login/';
    }
  };
  getPromise({
      endpoint: api.users.me, 
      token
  })
  .then(response => response.json())
  .then(data => {
      if(!data.error){
          if(URL_BASE.indexOf(location.href) < 0)
            location.href = "/";
      } else {
        if(location.href.indexOf('login') < 0) {
            location.href = '/login/';
        }
        
      }
      
  })
  .catch(error => console.log('error', error))
}