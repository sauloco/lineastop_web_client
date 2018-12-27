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
    api.users.me()
    .then(data => {
        if(!data.error){
            location.href = "/";
        }
    })
    .catch(error => console.log('error', error))
}

const validarToken_unused = (token) => {

    fetch(BASE_URI + '/users/me', {
        method:'GET',
        headers: {
            'Authorization': "Bearer " + token,
            'Content-Type': 'application/json'
        }
    })
        .then(data => {
            if(!data.error){
                location.href = "/";
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

    api.auth.local.login(body)
        .then(data => data.json())
        .then(data => {
            setCookie('jwt', data.jwt, 2)
        })
        .catch(error => console.log('error', error));
};

const registrarUsuario = () => {
    
    location.href = "/usuario/nuevo";
         
};


