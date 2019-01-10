const BASE_URI = 'https://hcdigital.herokuapp.com';

$(document).ready(function(){
    M.updateTextFields();
    $('#iniciar').click(iniciarSesion)
    $('#terminos').prop('checked', false)
    $('#registrar').click(aceptarTerminos)
   
});

const iniciarSesion = () => {
    const params = {
        user: $('#name').val(),
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

const aceptarTerminos = () => {
    if (document.getElementById('terminos').checked){
        // TODO validar datos y dar alta
    }
    else {
        M.toast({html:'Debe aceptar los Terminos y Condiciones'})
    }
}
const guardarNuevo = () => {

    // TODO: Cambiar a usuario/nuevo/index.html
    //location.href = "/"; 
    var toastHTML = '<span> Modulo en construcción</span><button class="btn-flat toast-action">aceptar</button>';
    M.toast({html:toastHTML})
         
};
