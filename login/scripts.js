$(document).ready(function(){
   
    $('#password').blur(activaIniciar)
    $('#iniciar').click(iniciarSesion)
    $('#registrar').click(registrarUsuario)
    $('#olvidar').click(olvideContrasena)
    
});

const activaIniciar = () => {
    let password = $('#password').val();
    
    if (!password){
        return M.toast({html:"La contraseña es obligatoria."});

    }
    $('#iniciar').attr('disabled', false);
}

const iniciarSesion = () => {

    const params = {
        identifier: $('#email').val(),
        password: $('#password').val() 
    }

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
const olvideContrasena = async () => {
    const params = {
        email: $('#email').val(),
    }    
    if (!params) { 
        M.toast({html:"El correo electrónico es obligatorio."});
        return false;
    }

    const data = await fetchData({endpoint: api.auth.forgotPassword, params});

    if (data) {
        M.toast({html: 'Si el correo electrónico es válido recibirá un mensaje con las instrucciones para continuar.'});
    }
}
const validarParametros = () => {
    // TODO: 
    // validar campos obligatorios
    
    const email = $('#email').val();
    if (!email) {
        M.toast({html:"El correo electrónico es obligatorio."});
        return false;
    }

    /*const password = $('#password').val();
    if (!password){
        M.toast({html:"La contraseña es obligatoria"});
        return false;
    }

    return true;
*/
}