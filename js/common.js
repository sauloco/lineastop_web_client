const URL_BASE = ['http://127.0.0.1:5500/', 'http://localhost:5500/'];

$(document).ready(() => {
    validarToken();
})


const validarToken = (token) => {
  token = token || getCookie('jwt') || '';
  if (!token) {
    if(location.href.indexOf('login') < 0) {
        location.href = `/login/?redirectTo=${encodeURIComponent(location.href)}`;
    }
  };
  getPromise({
      endpoint: api.users.me, 
      token
  })
  .then(response => response.json())
  .then(data => {
        if(location.href.indexOf('login') < 0) {
            if(data.error){
                location.href = `/login/?redirectTo=${encodeURIComponent(location.href)}`;
            }
        } else {
            if (!data.error) {
                const url = new URL(location.href);
                const redirectTo = url.searchParams.get('redirectTo');
                location.href = redirectTo ? decodeURIComponent(redirectTo) : '/';
            }
        }
      
  })
  .catch(error => {
    location.href = `/login/?redirectTo=${encodeURIComponent(location.href)}`;
    })
}