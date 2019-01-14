/** Cuando no se especifica qué hacer en el error, se puede usar este controlador.
 * 
 * @param {object | string} error - objeto con atributo message o string.
 */
const apiDefaultErrorController = ({endpoint, error}) => {
  let showMessage = '';
  if (endpoint.errors) {
    if (endpoint.errors[error.statusCode]) {
      if (typeof endpoint.errors[error.statusCode] === 'function') {
        showMessage = endpoint.errors[error.statusCode](error);
      } else {
        showMessage = endpoint.errors[error.statusCode];
      }
    } else {
      showMessage = endpoint.errors.default;
    }
  } else {
    if (api.common.errors[error.statusCode]) {
      if (typeof api.common.errors[error.statusCode] === 'function') {
        showMessage = api.common.errors[error.statusCode](error);
      } else {
        showMessage = api.common.errors[error.statusCode];
      }
    } else {
      showMessage = api.common.errors.default;
    }
  }
  
  
  if (typeof error === 'object') {
    if (error.message && typeof error.message === 'string') {
      // showMessage = error.message;
      // DoNothing
    }
  }
  if (typeof error === 'string') {
    showMessage = error;
  }
  M.toast({html: `${showMessage}`, displayLength: 4000});
  console.error('Error: ', error, 'At: ', endpoint, 'Displayed As: ', showMessage);
  return error;
}

/** Invoca una llamada a la API
 * 
 * @param {object} endpoint - Referencia a api.js > const api que contiene location y method.
 * @param {object} params? - los parámetros a enviar a la API, automáticamente se ajustan según el method.
 * @param {string} token? - jwt válida para el sistema. Si no se envía el procedimiento le otorgará una.
 * 
 * @returns una nueva Promise con el resultado del fetch
 */

const getPromise = ({endpoint, params, token}) => {
  
  const BASE_URI = 'https://hcdigital.herokuapp.com';
  let {location, method} = endpoint;
  
  if (location.split('')[0] !== '/'){
    location = `/${location}`;
  }
  location = `${BASE_URI}${location}`;
  
  if (!method) {
    method = 'GET';
  }
  
  
  let requestInit = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': 'es_AR',
    }
  };
  
  if (params) {
    if (method === 'POST') {
      requestInit.body = JSON.stringify(params);
    } else {
      requestInit.data = params;
    }
  }
  
  token = token || getCookie('jwt');

  if (token) {
    requestInit.headers['Authorization'] = `Bearer ${token}`;
  }
  return fetch(location, requestInit);
}

/** Funcion asincrona que llama a la API y devuelve la data y opcionalmente maneja el error o no.
 * 
 * @param {object} endpoint - Referencia a `api.js > const api` que contiene `{location, method}`.
 * @param {object} params (Op.) - los parámetros a enviar a la API, automáticamente se ajustan según el `endpoint.method`.
 * @param {string} token (Op.) - `jwt` válida para el sistema. Si no se envía el procedimiento le otorgará una.
 * @param {boolean} controlError (Op.) - Default: `false`. Interruptor para decidir si la función debe manejar el caso de error o lo hará el usuario luego.
 * 
 * @returns {object} La información obtenida de la API (sea la data o el error)
 */

const fetchData = async ({endpoint, params, token, controlError}) => {
  let response = await getPromise({endpoint, params, token});
  try {
    if ((response.status >= 200 && response.status < 300) || !controlError)  {
      response = await response.json();
      return response;
    }
    return api.common.errorHandler({endpoint, error: response});
  } catch {
    return api.common.errorHandler({endpoint, error: response});
  }  
}

const api = {
  common: {
    errors: {
      400: 'Ocurrió un error. Inicia sesión nuevamente y reintenta la acción.',
      401: 'Las credenciales no parecen válidas, por favor, inicia sesión nuevamente.',
      403: 'Su usuario no tiene permiso suficiente para acceder al recurso solicitado.',
      404: 'No se encontró el recurso solicitado.',
      405: 'El tipo de solicitud es inválida.',
      410: 'El recurso solicitado ya no está disponible.',
      500: 'Ocurrió un error inesperado en nuestros servidores, ya se le ha notificado a nuestros desarrolladores del inconveniente.',
      default: 'Ocurrió un error inesperado, ya se le ha notificado a los desarrolladores del inconveniente.',
    },
    errorHandler: apiDefaultErrorController,
  },
  users: {
    me: {
      location: 'users/me'
    },
    all: {
      location: 'users/',
    },
    findBy: {
      location: 'users',
    }
  },
  auth: {
    local: {
      login: {
        location: 'auth/local',
        method: 'POST',
        errors: {
          default: 'Ocurrió un error durante el inicio de sesión, por favor, reintenta.',
          400: (error) => {
            switch (error.message) {
              case 'Identifier or password invalid.':
                return 'Correo o contraseña inválidos';
              case 'Please provide your username or your e-mail.':
                return 'El correo electrónico es obligatorio';
              case 'Please provide your password.':
                return 'La contraseña es obligatoria';
              default: 
                return api.auth.local.login.errors.default;
            }
          }
        }
      },
      register: {
        location: 'auth/local/register',
        method: 'POST'
      }
    },
    forgotPassword: {
      location: 'auth/forgot-password',
      method: 'POST',
      errors: {
        default: 'Ocurrió un error durante el envío del correo electrónico, por favor, reintenta.',
        400: (error) => {
          switch (error.message) {
            case 'This email does not exist.':
              return 'El correo ingresado no existe';
            default: 
              return api.auth.forgotPassword.errors.default;
          }
        }
      }
    }
  }
}