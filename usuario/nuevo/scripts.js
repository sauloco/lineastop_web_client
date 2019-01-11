const BASE_URI = 'https://hcdigital.herokuapp.com';

$(document).ready(function(){
   
    $('#terminos').prop("checked", false);
    $('#terminos').click(aceptarTerminos);
   
});

const aceptarTerminos = () => {
    if (document.getElementById('terminos').checked){
        // TODO validar mail y datos completos.
        $('#registrar').attr('disabled', false);
        $('#registrar').click(guardarNuevo);

    }
    else {
        $('#registrar').attr('disabled', true);
    }
}
const guardarNuevo = () => {
    if (!validarParametros()) {
        return;
    }

    
    // TODO: Validar usuario, correo y contraseña.
    

    const params = {
        username,
        email,
        password,
    };

    getPromise({endpoint: api.auth.local.register, params})
        .then(response => response.json())
        .then(data => {
            if(data.error){
                return api.common.errorHandler({endpoint: api.auth.local.register, error: data});
            }
            M.toast({html:"Revise su correo electrónico. ..sad.asd.ad as.dsa.asd"});
        })
        .catch(error => api.common.errorHandler({endpoint: api.auth.local.register, error}));

};
 

const validarParametros = () => {
    // TODO: 
    // validar campos obligatorios
    // validar que mail sea valido
    // validar que contraseña sea mayor o igual a 8 caracteres
    // validar que checkbox este tildado
    // validar que usuario no exista ya en la base de datos https://hcdigital.herokuapp.com/users?username={{username}}
    // validar que correo electrónico no exista ya en la base de datos https://hcdigital.herokuapp.com/users?email={{email}}

    let username;
    if ($('#name').val()){
        username = $('#name').val();
    } else {
        M.toast({html:"Escriba un Nombre de usuario"});
        return false;
    }

    const email = $('#email').val();
    if (!email) {
        M.toast({html:"El correo electrónico es obligatorio."});
        return false;
    }

    const regexpEmail = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!regexpEmail.test(email)) {
        M.toast({html:"El correo electrónico es inválido."});
        return false;
    }

    // $('#password').val();

    return true;
}