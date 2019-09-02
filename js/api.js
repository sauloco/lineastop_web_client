const DEFAULT_LIMIT = Number.MAX_SAFE_INTEGER;

const API_production = 'https://hcdigital.herokuapp.com';
const API_staging = 'https://stag-lineastop.herokuapp.com';
const API_development = 'http://localhost:1337';

const BASE_URI = API_staging;



if (BASE_URI === API_production) {
  let sentryScript = document.createElement('script');
  sentryScript.setAttribute('src',"https://browser.sentry-cdn.com/4.4.2/bundle.min.js");
  sentryScript.setAttribute('crossorigin', 'anonymous');
  document.head.appendChild(sentryScript);
  sentryScript.onload(() => {
    Sentry.init({
      dsn: 'https://e3abd2577a644e5a84e1b4398d0f56f5@sentry.io/1363621'
    });
  })
}

const addCreationUser = ({params}) => {
  if (!params.createdBy) {
    params.createdBy = getCookie('id');
  }  
  return true;
}

const addUpdatingUser = ({params}) => {
  if (!params.updatedBy) {
    params.updatedBy = getCookie('id');
  }  
  return true;
}

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
  
  

  let {location, method, url_params, contentType} = endpoint;
  if (location.split('')[0] !== '/'){
    location = `/${location}`;
  }
  location = `${BASE_URI}${location}`;
  
  if (!method) {
    method = 'GET';
  }
  if (!contentType) {
    contentType = 'application/json'
  }  
  
  let requestInit = {
    method: method,
    headers: {
      'Content-Type': contentType,
    }
  };
  
  params = params || {};
  
  if (params || method === 'GET') {
    
    switch (method) {
      case 'GET': 
        if (url_params && url_params.length) {
          const param_names = url_params.map(v => v.split(':').join(''));
          for (name of param_names) {
            const param_value = params[name];
            location += `/${param_value}`;
          }
        } else {
          location += '?';
          let keys = Object.keys(params);
          if (!keys.length || !params['_limit']) {
            params['_limit'] = DEFAULT_LIMIT;
            keys = Object.keys(params);
          }
          for (const key of keys) {
            location += `${key}=${encodeURIComponent(params[key])}&`;
          }
          location = location.substr(0, location.length-1);
        }
        
        break;
      case 'POST':
        requestInit.body = JSON.stringify(params);
        break;
      case 'PUT':
      case 'DELETE':
        const param_names = url_params.map(v => v.split(':').join(''));
        for (name of param_names) {
          const param_value = params[name];
          location += `/${param_value}`;
          delete params[name];
        }
        requestInit.body = JSON.stringify(params);
      break;
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
  const {middlewareActions, overrideDefaultAction} = endpoint;

  if (overrideDefaultAction && typeof overrideDefaultAction === 'function') {
    return await overrideDefaultAction({endpoint, params, token, controlError});
  }
  
  if (middlewareActions) {
    const addedToQueue = addToMiddlewareQueue(middlewareActions);
    if (!addedToQueue) {
      return api.common.errorHandler({endpoint, error: 'Ocurrió un error inesperado colocando en cola los preprocesos de la petición.'});
    }
    const retorno = await runMiddlewareQueue({endpoint, params, token});
    if (!retorno || retorno.error) {
      return api.common.errorHandler({endpoint, error: retorno.error || 'Ocurrió un error inesperado antes de procesar la petición al servidor.'});
    }
  }
  let response = {};
  try {
    response = await getPromise({endpoint, params, token});
    if ((response.status >= 200 && response.status < 300) || !controlError)  {
      response = await response.json();
      return response;
    }
    if (response.status === 500) {
      console.error({response});
    }
    return api.common.errorHandler({endpoint, error: response});
  } catch (e) {
    if (e.message === 'Failed to fetch') {
      response = {
        statusCode: 503,
        error: true,
        message: 'El servidor se encuentra temporalmente desactivado.'
      }
    }
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
      503: 'El servidor se encuentra en modo de mantenimiento en este momento.',
      default: 'Ocurrió un error inesperado, ya se le ha notificado a los desarrolladores del inconveniente.',
    },
    errorHandler: apiDefaultErrorController,
  },
  personas: {
    all: {
      location: 'personas/',
    },
    count: {
      location: 'personas/count',
    },
    get: {
      location: 'personas',
      url_params: [':_id'],
    },
    create: {
      method: 'POST',
      location: 'personas/',
      middlewareActions: [addCreationUser, addUpdatingUser]
    },
    update: {
      method: 'PUT',
      location: 'personas',
      url_params: [':_id'],
      middlewareActions: [addUpdatingUser]
    },
    delete: {
      method: 'DELETE',
      location: 'personas',
      url_params: [':_id'],
    }
  },
  consultas: {
    all: {
      location: 'consultas/'
    },
    get: {
      location: 'consultas',
      url_params: [':_id'],
    },
    create: {
      method: 'POST',
      location: 'consultas/',
      middlewareActions: [addCreationUser, addUpdatingUser]
    },
    update: {
      method: 'PUT',
      location: 'consultas',
      url_params: [':_id'],
      middlewareActions: [addUpdatingUser]
    },
    findBy: {
      location: 'consultas',
    },
    delete: {
      method: 'DELETE',
      location: 'consultas',
      url_params: [':_id']
    }
  },
  plantillaMensaje: {
    findBy: {
      location: 'plantillamensajes'
    }
  },
  email: {
    send: {
      location: 'email',
      method: 'POST',
      errors: {
        default: 'Ocurrió un error al enviar el correo electrónico, por favor, reintenta nuevamente más tarde.',
      }
    },
    create: {
      method: 'POST',
      location: 'emails',
      middlewareActions: [addCreationUser, addUpdatingUser]
    },
    update: {
      method: 'PUT',
      location: 'emails',
      url_params: [':_id'],
      middlewareActions: [addUpdatingUser]
    },
    findBy: {
      location: 'emails'
    }
  },
  whatsapps: {
    create: {
      method: 'POST',
      location: 'whatsapps',
      middlewareActions: [addCreationUser, addUpdatingUser]
    },
    update: {
      method: 'PUT',
      location: 'whatsapps',
      url_params: [':_id'],
      middlewareActions: [addUpdatingUser]
    },
    findBy: {
      location: 'whatsapps'
    }
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
    },
    get: {
      location: 'users',
      url_params: [':_id'],
    },
    update: {
      method: 'PUT',
      location: 'users',
      url_params: [':_id'],
    }
  },
  auth: {
    resetPassword: {
      method: 'POST',
      location: 'auth/reset-password',
      errors: {
        default: 'Ocurrió un error al solicitar el reinicio de la contraseña, por favor, reintenta'
      }
    },
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
        method: 'POST',
        errors: {
          default: 'Ocurrió un error durante el registro, por favor, reintenta.',
          400: (error) => {
            switch (error.message) {
              case 'Email is already taken.':
                return 'El correo electrónico provisto ya tiene un usuario';
              case 'This hcdigital,users,permissions is already taken':
                return 'El nombre de usuario ya ha sido utilizado';
              case 'Please provide your password.':
                return 'La contraseña es obligatoria';
              default: 
                return api.auth.local.register.errors.default;
            }
          }
        }
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

let middlewareActions = [];

const runMiddlewareQueue = async ({endpoint, params, token}) => {
  for (const action of middlewareActions) {
    const response = await action({endpoint, params, token});
    if (!response || response.error) {
      return response;
    }
  }
  return true;
}

const addToMiddlewareQueue = (action) => {
  if (typeof action === 'object' && Array.isArray(action)) {
    for (const eachAction of action){
      const retorno = addToMiddlewareQueue(eachAction);
      if (!retorno) {
        return retorno;
      }
    }
    return true;
  }
  if (typeof action !== 'function') {
    console.error(`Action ${action.toString()} isn't a function`);
    return false;
  }
  middlewareActions.push(action);
  return true;
}

let preprocessActions = [];

const runPreprocessQueue = async ({endpoint, params, token}) => {
  for (const action of middlewareActions) {
    const response = await action({endpoint, params, token});
    if (!response || response.error) {
      return response;
    }
  }
  return true;
}

const addToPreprocessQueue = (action) => {
  if (typeof action === 'object' && Array.isArray(action)) {
    for (const eachAction of action){
      const retorno = addToMiddlewareQueue(eachAction);
      if (!retorno) {
        return retorno;
      }
    }
    return true;
  }
  if (typeof action !== 'function') {
    console.error(`Action ${action.toString()} isn't a function`);
    return false;
  }
  middlewareActions.push(action);
  return true;
}