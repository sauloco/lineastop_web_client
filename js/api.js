/** Cuando no se especifica qué hacer en el error, se puede usar este controlador.
 * 
 * @param {object | string} error - objeto con atributo message o string.
 */
const apiDefaultErrorController = ({error}) => {
  let showMessage = 'Ocurrió un error inesperado.';
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

const goToAPI = ({location, method, params, token}) => {
  const BASE_URI = 'https://hcdigital.herokuapp.com';
  if (location.split('')[0] !== '/'){
    location = `/${location}`;
  }
  location = `${BASE_URI}${location}`;
  if (!method) {
    method = 'GET';
  }
  if (!token) {
    token = getCookie('jwt');
  }
  let requestInit = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': 'es_AR'
    }
  };
  if (params) {
    if (method === 'POST') {
      requestInit.headers.body = params;
    } else {
      requestInit.data = params;
    }
  }

  if (!token) {
    token =  getCookie('jwt');
  };
  if (token) {
    requestInit.headers['Authorization'] = `Bearer ${token}`;
  }
  return fetch(location, requestInit);
}

const getDataFromAPI = async ({descriptor, params, noControlError}) => {
  const rawData = await descriptor(params);
  if ((rawData.status >= 200 && rawData.status < 300) || noControlError)  {
    return await rawData.json();
  }
  switch(rawData.status) {
    case 404: 
      break;
    default: 
  }
}



const api = {
  common: {
    errors: {
      400: 'Petición de información inválida.',
      401: 'Las credenciales no parecen válidas, por favor, inicia sesión nuevamente.',
      402: 'Se requiere un pago para continuar.',
      403: 'Su usuario no tiene permiso suficiente para acceder al recurso solicitado.',
      404: 'No se encontró el recurso solicitado.',
      405: 'El tipo de solicitud es inválida.',
      410: 'El recurso solicitado ya no está disponible.',
      500: 'Ocurrió un error inesperado en nuestros servidores, ya se le ha notificado a nuestros desarrolladores del inconveniente.',
      default: 'Ocurrió un error inesperado, ya se le ha notificado a los desarrolladores del inconveniente.',
    }
  },
  users: {
    me: {
      location: 'users/me',
      errors: {
        400: 'Ocurrió un error. Inicia sesión nuevamente y reintenta la acción.',
      }
    },
    all: {
      location: 'users/',
      errors: {

      },
      getPromise: () => goToAPI({location: api.users.all.location}),
      getData: async (noControlError) => await getDataFromAPI({rawData: await users.all.getPromise, noControlError}),
    }
  };
  auth: {
    local: {
      login: {
        location: 'auth/local',
        method: 'POST',
        label: {
          singular: 'Inicio de sesión',
          isFemenine: false
        },
        getPromise: ({identifier, password}) => goToAPI({location: api.auth.local.login, method: api.auth.local.login.method, body: {identifier, password}}),
        getData: async ({identifier, password}) => getDataFromAPI({rawData: await auth.local.login.getPromise(), body: {identifier, password}})
      },
      register: ({username, identifier, password}) => goToAPI({location: 'auth/local/register', method: 'POST', body: {username, identifier, password}}),
    }
  }
}