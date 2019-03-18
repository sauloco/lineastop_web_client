const code = new URL(location.href).searchParams.get('code');
const email = new URL(location.href).searchParams.get('user');

$(document).ready(function () {
  $("#password").blur(validarContrasenia);
  $("#cambiar").click(enviarContrasenia);
  $("#email").val(email);
  M.updateTextFields();
  if (!code) {
    M.toast({
      html: 'El vínculo es inválido. Contacte al administrador para obtener un código de reinicio de contraseña válido.'
    });
    $('#cambiar').attr('disabled', true);
  }

});

const validarContrasenia = () => {
  const password = $('#password').val();
  if (!password) {
    M.toast({
      html: "La contraseña es obligatoria."
    });
    return false;
  }

  if (password.length < 8) {
    M.toast({
      html: "La contraseña debe tener como mínimo 8 caracteres."
    });
    return false;
  }
  $('#cambiar').attr('disabled', false);
}

const enviarContrasenia = () => {
  const params = {
    code,
    password: $('#password').val(),
    passwordConfirmation: $('#password').val()
  }

  const data = fetchData({endpoint: api.auth.resetPassword, params});
  if (data.error) {
    api.common.errorHandler({endpoint: api.auth.resetPassword, error: data.error});
  }
  M.toast({html: 'La contraseña fue cambiada exitosamente.'});
  setTimeout(() => {
    location.href = '/login/'
  }, 1000);
}