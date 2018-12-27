/** Cuando no se especifica qué hacer en el error, se puede usar este controlador.
 * 
 * @param {object | string} error - objeto con atributo message o string.
 */
const apiDefaultErrorController = ({endpoint, error}) => {
  let showMessage = endpoint.errors[error.statusCode] || api.common.errors[error.statusCode] || api.common.errors.default;
  if (typeof error === 'object') {
    if (error.message && typeof error.message === 'string')
      showMessage = error.message;
    else 
      showMessage = 'Las credenciales son inexistentes o inválidas'
  }
  if (typeof error === 'string') {
    showMessage = error;
  }
  M.toast({html: `${showMessage}`, displayLength: 4000});
  console.log.error(error);
}

/** Invoca una llamada a la API
 * 
 * @param {string} location - La ubicacion del endpoint de la API
 * @param {string} method? - GET (default), POST, PUT, DELETE
 * @param {object} params? - los parámetros a enviar a la API, automáticamente se ajustan según el method.
 * @param {string} token? - jwt válida para el sistema. Si no se envía el procedimiento le otorgará una.
 * 
 * @returns una nueva Promise con el resultado del fetch
 */

const getPromise = ({endpoint, params, token}) => {
  
  const BASE_URI = 'https://hcdigital.herokuapp.com';
  const {location, method} = endpoint;
  
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
      'Accept-Language': 'es_AR'
    }
  };
  
  if (params && validateParams({endpoint, params})) {
    if (method === 'POST') {
      requestInit.headers.body = params;
    } else {
      requestInit.data = params;
    }
  }
  
  token = token || getCookie('jwt');
  requestInit.headers['Authorization'] = `Bearer ${token}`;

  return fetch(location, requestInit);
}

const fetchData = async ({endpoint, params, token, controlError}) => {
  const rawData = await getPromise({endpoint, params, token});
  const data = await rawData.json();
  
  if ((rawData.status >= 200 && rawData.status < 300) || !controlError)  {
    return data;
  }
  return api.common.errorHandler({endpoint, data});
}

const validateParams = ({endpoint, params}) => {
  for (const param of Object.keys(endpoint.params)){
    const validType = endpoint.params[param].type && validateType(params[param], endpoint.params[param].type)
  }
}

const api = {
  common: {
    errors: {
      400: 'Ocurrió un errror. Inicia sesión nuevamente y reintenta la acción.',
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
    }
  },
  auth: {
    local: {
      login: {
        location: 'auth/local',
        method: 'POST',
      },
      register: {
        location: 'auth/local/register',
        method: 'POST'
      }
    }
  }
}