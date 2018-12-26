const BASE_URI = 'https://hcdigital.herokuapp.com';

$(document).ready(function(){
    const jwt = getCookie('jwt');
    if (jwt !== ''){
        validarToken(jwt);
    }
    $('#iniciar').click(iniciarSesion)
    $('#registrar').click(registrarUsuario)
   
});

const validarToken = (token) => {

    fetch(BASE_URI + '/users/me', {
        method:'GET',
        headers: {
            'Authorization': "Bearer " + token,

            'Content-Type': 'application/json'
        }
    })
        .then(data => {
            if(!data.error){
                //checkCookie()
//                location.href = "/";
            }
        })
        .catch(error => console.log('error', error))
}

const iniciarSesion = () => {
    const body = {
        identifier: $('#email').val(),
        password: $('#password').val() 
    }
    
    // TODO: Validar Correo y Contraseña.

    fetch(BASE_URI + '/auth/local', {
        method:'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(data => data.json())
        .then(data => {
            setCookie('jwt', data.jwt, 2)
            if(error !== ""){
                if(error.message ==='object'){
                    fetch.applycatch(error => M.toast({html: 'Se han producido varios errores!'}))
                }
            }
        })
        .catch(error => M.toast({html: 'Se ha producido un error!'+ error}))
         
};

const registrarUsuario = () => {
    
    location.href = "/registro/registro.html";
         
};


function setCookie(cname, cvalue, exdays) {
    let d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    const expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }
  
  function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
  
  function checkCookie() {
    var user = getCookie("cname");
    if (user != "") {
      alert("Welcome again " + user);
    } 
  }