/**
 * @constant
 * @default 2
 */
const DEFAULT_EXPIRATION_DAYS = 2;

/** Establece nobmre, valor y tiempo de expiración para la cookie
 * 
 * @param {string} name - nombre de clave del valor
 * @param {string} value - valor de atributo de la cookie
 * @param {string} day - cantidad de días que será válida la cookie. 
 *                       Valor por defecto DEFAUL_EXPIRATION_DAYS.
 * @param {boolean} force - fuerza a sobreescribir el valor de una cookie existente
 * 
 * @returns {boolean} El resultado de la operación. 
 *                    Si es falso es porque la cookie ya existía y no se indicó 
 *                    sobreescribir con force = true.
 */
const setCookie = ({name, value, day, force}) => {
  if (getCookie(name) !== "" && !force) return false;
  let d = new Date();
  d.setTime(d.getTime() + ((day || DEFAULT_EXPIRATION_DAYS) * 24 * 60 * 60 * 1000));
  const expires = "expires="+d.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
  return true;
}

/** 
 * 
 * @param {string} name - El nombre con que fue guardado el valor de la cookie.
 */
const getCookie = (name) => {
  name += "=";
  const cookies = document.cookie.split(';');
  for(cookie of cookies) {
    while (cookie.charAt(0) == ' ') {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(name) == 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return "";
}