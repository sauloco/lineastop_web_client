document.querySelector("#button-enviar").addEventListener("click", enviar);
document.querySelector("#textarea1").addEventListener("keyup", onEnter);
document.addEventListener("DOMContentLoaded", getAllPersonas);

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
        created_at: fechaTexto,//fecha creacion
        sender_default_name: yo.username,//nombre del que envia
       // seen_at,//fecha del visto, 
        target_default_name: document.querySelector(".titulo").innerHTML,//nombre recibe
       // deleted_at,//fecha borrado
        sent_at: fechaTexto,//fecha enviado
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

async function getAllPersonas() {
    let length = await fetchData({
      endpoint: api.personas.count
    });
    if (length.error) {
      length = DEFAULT_LIMIT;
    }
    const params = {
      '_limit': length,
    };
    const personas = await fetchData({
      endpoint: api.personas.all,
      params
    });
    if (personas.error) {
      api.common.errorHandler({
        endpoint: api.personas.all,
        personas
      });
      return;
    }
    
    personas.sort(function (a, b){
        const personaA = `${a.apellido} ${a.nombre}`.toLowerCase();
        const personaB = `${b.apellido} ${b.nombre}`.toLowerCase();
        if (personaA > personaB) {
            return 1;
          }
          if (personaA < personaB) {
            return -1;
          }
          return 0;
    });
    for (const persona of personas) {
       let personahtml = `<a id="${persona._id}" href="#!" class="collection-item" onclick="cargarHistorial(this)" >${persona.apellido} ${persona.nombre}</a>`;
       document.querySelector(".collection").innerHTML += personahtml;
    }
  }
  
  function cargarHistorial(elemento) {
    document.querySelector(".titulo").innerHTML = elemento.innerHTML;
    document.querySelector(".titulo").setAttribute("persona_id", elemento.id);

  }