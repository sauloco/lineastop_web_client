const BASE_URI = 'https://hcdigital.herokuapp.com';

$(document).ready(function(){
    $('#iniciar').click(iniciarSesion)
});

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
        .then(data => console.log('data', data))
        .catch(error => console.log('error', error))
         
};