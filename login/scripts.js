const BASE_URI = 'https://hcdigital.herokuapp.com';

$(document).ready(function(){
   
    $('#iniciar').click(iniciarSesion)
    $('#registrar').click(registrarUsuario)
    $('#olvidar').click(olvideContraseña)
   
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
    location.href = "/usuario/nuevo/index.html"; 
         
};
const olvideContraseña = () => {
    const params = {
        identifier: $('#email').val(),
    }    
    if (!params) { 
        M.toast({html:"El correo electrónico es obligatorio."});
        return false;
    }
    getPromise({endpoint: api.auth.forgotPassword, params})
        .then(response => response.json())
        .then(data => {
            if(data.error){
                return api.common.errorHandler({endpoint: api.auth.forgotPassword, error: data});
            }
            setCookie({name: 'jwt', value: data.jwt, day: 2, force: true});
            validarToken()
        })
        .catch(error => api.common.errorHandler({endpoint: api.auth.forgotPassword, error}));

}