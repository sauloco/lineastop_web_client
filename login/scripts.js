const BASE_URI = 'https://hcdigital.herokuapp.com';

$(document).ready(function(){
   
    $('#iniciar').click(iniciarSesion)
    $('#registrar').click(registrarUsuario)
   
});

const iniciarSesion = () => {
    const params = {
        identifier: $('#email').val(),
        password: $('#password').val() 
    }
    
    // TODO: Validar Correo y Contraseña.

    getPromise({endpoint: api.auth.local.login, params})
        .then(response => response.json())
        .then(data => {
            if(data.error){
                return api.common.errorHandler({endpoint: api.auth.local.login, error: data});
            }
            setCookie({name: 'jwt', value: data.jwt, day: 2, force: true});
            validarToken()
        })
        .catch(error => api.common.errorHandler({endpoint: api.auth.local.login, error}));
};

const registrarUsuario = () => {

    // TODO: Cambiar a usuario/nuevo/index.html
    location.href = "/registro/registro.html"; 
         
};