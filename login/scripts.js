$(document).ready(function () {

    $('#password').blur(activaIniciar)
    $('#iniciar').click(iniciarSesion)
    $('#registrar').click(registrarUsuario)
    $('#olvidar').click(olvideContrasena)

});

const activaIniciar = () => {

    let password = $('#password').val();

    if (!password) {
        M.toast({
            html: "La contraseña es obligatoria."
        });
        return
    }
    $('#iniciar').attr('disabled', false);
}

const iniciarSesion = () => {

    const params = {
        identifier: $('#email').val(),
        password: $('#password').val()
    }

    getPromise({
            endpoint: api.auth.local.login,
            params
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                return api.common.errorHandler({
                    endpoint: api.auth.local.login,
                    error: data
                });
            }
            setCookie({
                name: 'jwt',
                value: data.jwt,
                day: 2,
                force: true
            });
            setCookie({
                name: 'username',
                value: data.user.username,
                day: 2,
                force: true
            });
            setCookie({
                name: 'email',
                value: data.user.email,
                day: 2,
                force: true
            });
            setCookie({
                name: 'id',
                value: data.user._id,
                day: 2,
                force: true
            });
            validarToken();
        })
        .catch(error => api.common.errorHandler({
            endpoint: api.auth.local.login,
            error
        }));
};

const registrarUsuario = () => {

    location.href = "/usuario/nuevo/";

};
const olvideContrasena = () => {

    const email = $('#email').val();
    if (!email) {
        M.toast({
            html: "El correo electrónico es obligatorio."
        });
        return false;
    }
    const params = {
        email
    }
    const data = fetchData({
        endpoint: api.auth.forgotPassword,
        params
    });

    M.toast({
        html: 'Si el correo electrónico es válido recibirá un mensaje con las instrucciones para continuar.'
    });
}