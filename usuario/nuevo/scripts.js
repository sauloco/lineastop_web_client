$(document).ready(function(){
   
    $('#terminos').prop("checked", false);
    $('#terminos').click(validarParametros);
   
});

const validarParametros = () => {

    const username = $('#name').val();
    if (!username){
        M.toast({html:"El nombre de usuario es obligatorio"});
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
    
    if (password.length < 8){
        M.toast({html:"La contraseña debe tener como mínimo 8 caracteres."});
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
    
    // let params = {username: $('#name').val()}

    // let data = await fetchData({endpoint: api.users.findBy, params});

    // if (data.length) { 
    //     M.toast({html: 'Ya existe un usuario registrado con ese nombre de usuario'})
    //     return;
    // }   
    
    // params = {email: $('#email').val()}
    
    // data = await fetchData({endpoint: api.users.findBy, params});

    // if (data.length) { 
    //     M.toast({html: 'Ya existe un usuario registrado con esa direccion de correo electrónico'})
    //     return;
    // }   

    params = {
        username: $('#name').val(),
        email: $('#email').val(),
        password: $('#password').val()
    }
    
    const data = await fetchData({endpoint: api.auth.local.register, params});
    
    if(data.error){
        return api.common.errorHandler({endpoint: api.auth.local.register, error: data});
    }
    M.toast({html:'Revise su correo electrónico y siga las instrucciones recibidas'});

}
    

    