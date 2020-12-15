$(document).ready(function () {

    $('#password').keypress(activaIniciar)
    $('#iniciar').click(iniciarSesion)
    $('#olvidar').click(olvideContrasena)

});

const activaIniciar = (e) => {
    if (e.keyCode === 13) {
        return iniciarSesion();
    }
}

const iniciarSesion = async () => {

    const params = {
        identifier: $('#email').val(),
        password: $('#password').val()
    }

    if (!params.identifier && !params.password) {
        return M.toast({html: 'El correo electrónico y la contraseña son obligatorios.'});
    }
    if (!params.identifier) {
        return M.toast({html: 'El correo electrónico es obligatorio.'});
    }
    if (!params.identifier) {
        return M.toast({html: 'La contraseña es obligatoria.'})
    }

    const data = await fetchData({
        endpoint: api.auth.local.login,
        params
    });

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
    fetchData({
        endpoint: api.auth.forgotPassword,
        params
    });

    M.toast({
        html: 'Si el correo electrónico es válido recibirá un mensaje con las instrucciones para continuar.'
    });
}