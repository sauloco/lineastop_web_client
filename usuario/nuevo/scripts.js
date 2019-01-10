const BASE_URI = 'https://hcdigital.herokuapp.com';

$(document).ready(function(){
   
    $('#terminos').prop("checked", false)
    $('#terminos').click(aceptarTerminos)
   
});

const aceptarTerminos = () => {
    if (document.getElementById('terminos').checked){
        // TODO validar mail y datos completos.
        $('#registrar').attr('disabled', false)
        $('#registrar').click(guardarNuevo)

    }
    else {
        M.toast({html:'Debe aceptar los Terminos y Condiciones'})
    }
}
const guardarNuevo = () => {
    M.toast({html:"modulo en construccion"})

/**    const params = {
        user: $('#name'), val(),
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
*/
    };
 

         
