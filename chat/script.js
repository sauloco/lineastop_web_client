document.querySelector("#button-enviar").addEventListener("click", enviar);
document.querySelector("#textarea1").addEventListener("keyup", onEnter);
document.addEventListener("DOMContentLoaded", getAllAnonimos);

function onEnter(event) {
    if (!event.shiftKey && event.keyCode === 13) {
        event.preventDefault();
        enviar();
    }
}

async function enviar() {
    let body = document.querySelector("#textarea1").value; 
    let fecha = new Date()
    const fechaTexto = fecha.toLocaleString('es-AR', {timeStyle: 'short', dateStyle: 'short'});
    document.querySelector("#textarea1").value = "";
    let mensajehtml =  `<div class="col s6 offset-s6" id= "m_${fecha.getTime()}">
                    <div class="card-panel teal light-blue lighten-4">
                        <div class="mensaje">${body}</div>
                        <div class= "estatus"> Pendiente: ${fechaTexto}</div>
                    </div>
                </div>`;
    document.querySelector(".message-wrapper").innerHTML += mensajehtml;
    const yo = await fetchData({
      endpoint: api.users.me
    });
     const mensaje = await fetchData({
      endpoint: api.mensajes.create,
      params: {
        body, //texto mensaje
        created_at: normalizeDateTime(fechaTexto),//fecha creacion
        sender_default_name: yo.username,//nombre del que envia
       // seen_at,//fecha del visto, 
        target_default_name: document.querySelector(".titulo").innerHTML,//nombre recibe
       // deleted_at,//fecha borrado
        sent_at: normalizeDateTime(fechaTexto),//fecha enviado
        sender: yo._id,//id del usario envia
        target:  document.querySelector(".titulo").getAttribute("persona_id"),//id usuario recibe
        //response,//id del mensaje que se responde
      }
    });
    if (mensaje.error) {
      api.common.errorHandler({
        endpoint: api.mensajes.create,
        mensaje
      });
      return;
    }  
    document.querySelector(`#m_${fecha.getTime()}`).id = mensaje._id 
}
function getNombreDeAnonimo(anonimo) {
  return anonimo.persona ? `${anonimo.persona.apellido} ${anonimo.persona.nombre}` : (anonimo.user ? anonimo.user.username : anonimo.pseudonimo);
}

async function getAllAnonimos() {
    let length = await fetchData({
      endpoint: api.anonimos.count
    });
    if (length.error) {
      length = DEFAULT_LIMIT;
    }
    const params = {
      '_limit': length,
    };
    const anonimos = await fetchData({
      endpoint: api.anonimos.all,
      params
    });
    if (anonimos.error) {
      api.common.errorHandler({
        endpoint: api.anonimos.all,
        anonimos
      });
      return;
    }
    
    anonimos.sort(function (a, b){
      const ASortedBy = getNombreDeAnonimo(a);
      const BSortedBy = getNombreDeAnonimo(b);
      const personaA = ASortedBy.toLowerCase();
      const personaB = BSortedBy.toLowerCase();
      if (personaA > personaB) {
          return 1;
        }
        if (personaA < personaB) {
          return -1;
        }
        return 0;
    });
    for (const anonimo of anonimos) {
      const fullname = getNombreDeAnonimo(anonimo);
      let anonimohtml = `<a id="${anonimo._id}" href="#!" class="collection-item" onclick="cargarHistorial(this)" >${fullname}</a>`;
      document.querySelector(".collection").innerHTML += anonimohtml;
    }
  }
  
  async function cargarHistorial(elemento) {
    document.querySelector(".titulo").innerHTML = elemento.innerHTML;
    document.querySelector(".titulo").setAttribute("persona_id", elemento.id);
    const yo = await fetchData({
      endpoint: api.users.me
    });
    const misAnonimos = await fetchData({
      endpoint: api.anonimos.findBy,
      params: {
        user: yo._id
      }
    });
    const miAnonimo = misAnonimos[0];
    const mensajesEnviados = await fetchData({
      endpoint: api.mensajes.findBy,
      params: {
        sender: miAnonimo._id, // string, id del usuario que tiene iniciada la sesión
        target: elemento.id, // string, id usuario seleccionado en la barra lateral
      }
    });
    const mensajesRecibidos = await fetchData({
      endpoint: api.mensajes.findBy,
      params: {
        target: elemento.id, // string, id usuario seleccionado en la barra lateral
        sender: miAnonimo._id, // string, id del usuario que tiene iniciada la sesión
      }
    });
    const mensajes = mensajesEnviados.concat(mensajesRecibidos);
    mensajes.sort(function (a, b){
      const fechaA = a.created_at;
      const fechaB = b.created_at;
      if (fechaA > fechaB) {
          return 1;
        }
        if (fechaA < fechaB) {
          return -1;
        }
        return 0;
   });
  }