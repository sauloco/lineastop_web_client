$(document).ready(function(){
   
    $('#terminos').prop("checked", false);
    $('#terminos').click(validarParametros);
   
});

const validarParametros = () => {

    // TODO: 
    // **validar campos obligatorios**
    // **validar que mail sea valido**
    // **validar que contraseña sea mayor o igual a 8 caracteres**
    // **validar que checkbox este tildado**
    // validar que usuario no exista ya en la base de datos https://hcdigital.herokuapp.com/users?username={{username}}
    // validar que correo electrónico no exista ya en la base de datos https://hcdigital.herokuapp.com/users?email={{email}}
    
    const username = $('#name').val();
    if (!username){
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

    const password = $('#password').val();
        if (!password){
        M.toast({html:"La contraseña es obligatoria."});
        return false;
    }
    const passtam = password.length;
    if (passtam!== 8){
        M.toast({html:"La contraseña debe tener 8 caracteres."});
        return false;
    } 
    
    if ($('#terminos').prop('checked')){
        $('#registrar').attr('disabled', false);
        $('#registrar').click(guardarNuevo);
        
    }
    
    else {
        $('#registrar').attr('disabled', true);
    }
}
const guardarNuevo = async () => {
    
    let params = {username: $('#name').val()}
    
    let data = await fetchData({endpoint: api.users.findBy, params}); //en esta linea me parece que trae siempre un array con "algo"

    console.log(data);
    if (data.length) { 
        M.toast({html: 'Ya existe un usuario registrado con ese nombre de usuario'})
        return;
    }   
    
    params = {email: $('#email').val()}
    
    data = await fetchData({endpoint: api.users.findBy, params}); //en esta linea me parece que trae siempre un array con "algo"

    console.log(data);
    if (data.length) { 
        M.toast({html: 'Ya existe un usuario registrado con esa direccion de correo electrónico'})
        return;
    }   

    params = {
        username: $('#name').val(),
        email: $('#email').val(),
        password: $('#password').val()
    }
        
    
    getPromise({endpoint: api.auth.local.register, params})
        .then(response => response.json())
        .then(data => {
            if(data.error){
                return api.common.errorHandler({endpoint: api.auth.local.register, error: data});
            }
            M.toast({html:"Revise su correo electrónico. ..sad.asd.ad as.dsa.asd"});
        })
        .catch(error => api.common.errorHandler({endpoint: api.auth.local.register, error}));
}
    

    