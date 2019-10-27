document.querySelector("#button-enviar").addEventListener("click", enviar);
document.querySelector("#textarea1").addEventListener("keyup", onEnter);
document.addEventListener("DOMContentLoaded", getAllAnonimos);

let currentTargetAnonimo;

let notSeenIds = [];
let seenInterval;
let anonimosLoaded = false;

function onEnter(event) {
  if (!event.shiftKey && event.keyCode === 13) {
    event.preventDefault();
    enviar();
  }
}

async function enviar() {
  let body = document.querySelector("#textarea1").value;
  let fecha = new Date();
  const fechaTexto = fecha.toLocaleString("es-AR", {
    timeStyle: "short",
    dateStyle: "short"
  });
  if (!yo) {
    yo = await fetchData({
      endpoint: api.users.me
    });
  }
  if (!miAnonimo) {
    const misAnonimos = await fetchData({
      endpoint: api.anonimos.findBy,
      params: {
        user: yo._id
      }
    });
    miAnonimo = misAnonimos[0];
  }

  document.querySelector("#textarea1").value = "";
  M.textareaAutoResize($("#textarea1"));
  await renderSentMessage({
    created_at: fecha,
    body,
    _id: `m_${fecha.getTime()}`,
    sender: miAnonimo
  }, false);
  const mensaje = await fetchData({
    endpoint: api.mensajes.create,
    params: {
      temp_id: fecha.getTime(),
      body,
      created_at: normalizeDateTime(fechaTexto),
      sender_default_name: yo.username,
      target_default_name: document.querySelector(".titulo").innerHTML, //nombre recibe
      sent_at: normalizeDateTime(fechaTexto),
      sender: miAnonimo._id,
      target: document.querySelector(".titulo").getAttribute("persona_id") //id usuario recibe
    }
  });
  if (mensaje.error) {
    api.common.errorHandler({
      endpoint: api.mensajes.create,
      mensaje
    });
    return;
  }
  document
    .querySelector(`#m_${fecha.getTime()}`)
    .setAttribute("id", mensaje._id);
  const selector = `#\\3${mensaje._id.split("")[0]} ${mensaje._id.substring(
    1,
    mensaje._id.length
  )}`;
  mensajeEnviado = document.querySelector(selector);
  mensajeEnviado.querySelector("i").innerHTML = "done";
  addSeenListener(mensaje._id);
}
function getNombreDeAnonimo(anonimo) {
  return anonimo.persona
    ? `${anonimo.persona.apellido} ${anonimo.persona.nombre}`
    : anonimo.user
    ? anonimo.user.username
    : anonimo.pseudonimo;
}

async function getAllAnonimos() {
  let length = await fetchData({
    endpoint: api.anonimos.count
  });
  if (length.error) {
    length = DEFAULT_LIMIT;
  }
  if (!yo) {
    yo = await fetchData({
      endpoint: api.users.me
    });
  }
  if (!miAnonimo) {
    const misAnonimos = await fetchData({
      endpoint: api.anonimos.findBy,
      params: {
        user: yo._id
      }
    });
    miAnonimo = misAnonimos[0];
  }
  const params = {
    _limit: length,
    user_ne: yo._id
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

  anonimos.sort(function(a, b) {
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

  const url = new URL(location.href);
  const to = url.searchParams.get("to");

  if (to && to !== miAnonimo._id) {

    let selector = `#${to}`;
    if (
      ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(
        to.split("")[0]
      )
    ) {
      selector = `#\\3${to.split("")[0]} ${to.substring(1, to.length)}`;
    }
    cargarHistorial(document.querySelector(selector));
  }
  anonimosLoaded = true;
}

async function cargarHistorial(elemento) {
  if (Array.from(elemento.classList).includes("active")) {
    return;
  }
  const item = document.querySelector(".collection-item.active");
  if (item) {
    item.classList.remove("active");
  }
  elemento.classList.add("active");
  elemento.classList.remove('hasMessages');
  document.querySelector("#textarea1").setAttribute("disabled", "disabled");
  document.querySelector("#button-enviar").classList.add("disabled");
  const loader = `  <div class="progress">
                          <div class="indeterminate"></div>
                      </div>`;
  document.querySelector(".message-wrapper").innerHTML = loader;

  document.querySelector(
    ".titulo"
  ).innerHTML = `Cargando conversación con ${elemento.innerHTML}`;
  document.querySelector(".titulo").setAttribute("persona_id", elemento.id);
  if (!yo) {
    yo = await fetchData({
      endpoint: api.users.me
    });
  }
  if (!miAnonimo) {
    const misAnonimos = await fetchData({
      endpoint: api.anonimos.findBy,
      params: {
        user: yo._id
      }
    });
    miAnonimo = misAnonimos[0];
  }
  if (!currentTargetAnonimo || currentTargetAnonimo._id !== elemento.id) {
    currentTargetAnonimo = await fetchData({
      endpoint: api.anonimos.get,
      params: { _id: elemento.id }
    });
  }
  const mensajesEnviados = await fetchData({
    endpoint: api.mensajes.findBy,
    params: {
      sender: miAnonimo._id, // string, id del usuario que tiene iniciada la sesión
      target: elemento.id // string, id usuario seleccionado en la barra lateral
    }
  });
  const mensajesRecibidos = await fetchData({
    endpoint: api.mensajes.findBy,
    params: {
      sender: elemento.id, // string, id usuario seleccionado en la barra lateral
      target: miAnonimo._id // string, id del usuario que tiene iniciada la sesión
    }
  });
  const mensajes = mensajesEnviados.concat(mensajesRecibidos);
  mensajes.sort(function(a, b) {
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

  if (mensajes.length) {
    document.querySelector(".message-wrapper").innerHTML = ``;
    for (const mensaje of mensajes) {
      if (mensaje.sender._id === miAnonimo._id) {
        await renderSentMessage(mensaje);
      } else {
        await renderReceivedMessage(mensaje);
      }
    }
  } else {
    document.querySelector(
      ".message-wrapper"
    ).innerHTML = `<div class = "no-message col s4 offset-s4"><div class = "card-panel grey lighten-3">Aún no has conversado con esta persona</div></div>`;
  }
  document.querySelector(".titulo").innerHTML = elemento.innerHTML;
  document.querySelector("#textarea1").removeAttribute("disabled");
  document.querySelector("#button-enviar").classList.remove("disabled");
  updateURL(elemento.id);
  if (!timeUpdater) {
    startTimeUpdater();
  }
}

async function renderSentMessage(mensaje, startSeenListener = true) {
  const noMessage = document.querySelector(".no-message");
  if (noMessage) {
    noMessage.style.display = "none";
  }
  const {
    created_at,
    body,
    _id,
    sent_at,
    seen_at,
    sender_default_name,
    target_default_name,
    sender,
    target,
    response,
    attachments
  } = mensaje;
  let fecha = moment(created_at).toISOString();
  let readableDate = moment(created_at).fromNow();

  let icon = "alarm";
  if (sent_at) {
    fecha = moment(sent_at).toISOString();
    readableDate = moment(sent_at).fromNow();
    icon = "done";
  }
  clase = "";
  if (seen_at) {
    clase = "blue-text";
    icon = "done_all";
  } else {
    if (startSeenListener) {
      addSeenListener(_id);
    }
  }

  let mensajehtml = `<div class="col s10 offset-s2" id= "${_id}">
                  <div class="card-panel light-blue lighten-4">
                    <div class="name">Tu</div>
                    <div class="mensaje">${body}</div>
                    <div class= "estatus">
                      <time datetime = "${fecha}" title="${displayDateTime(
    fecha
  )}">${readableDate}</time>
                      <i class="material-icons tiny ${clase}">${icon}</i>
                    </div>
                  </div>
              </div>`;
  document.querySelector(".message-wrapper").innerHTML += mensajehtml;
  document.querySelector('.message-wrapper').scrollTop = document.querySelector('.message-wrapper').scrollHeight;
}

async function renderReceivedMessage(mensaje) {
  const {
    created_at,
    body,
    _id,
    sent_at,
    seen_at,
    sender_default_name,
    target_default_name,
    sender,
    target,
    response,
    attachments
  } = mensaje;
  let fecha = moment(created_at).toISOString();
  let readableDate = moment(created_at).fromNow();
  document.querySelector("#textarea1").value = "";
  if (sent_at) {
    fecha = moment(sent_at).toISOString();
    readableDate = moment(sent_at).fromNow();
  }
  if (!seen_at) {
    setSeen(mensaje);
  }

  let name = sender_default_name;
  if (sender._id === currentTargetAnonimo) {
    if (currentTargetAnonimo.user) {
      name = currentTargetAnonimo.user.username;
    }
    if (currentTargetAnonimo.persona) {
      name = `${currentTargetAnonimo.persona.apellido} ${currentTargetAnonimo.persona.nombre}`;
    }
  }

  let mensajehtml = `<div class="col s10" id= "${_id}">
                  <div class="card-panel white">
                    <div class="name">${name}</div>
                    <div class="mensaje">${body}</div>
                    <div class= "estatus">
                      <time datetime = "${fecha}" title="${displayDateTime(
    fecha
  )}">${readableDate}</time>
                    </div>
                  </div>
              </div>`;
  document.querySelector(".message-wrapper").innerHTML += mensajehtml;
  document.querySelector('.message-wrapper').scrollTop = document.querySelector('.message-wrapper').scrollHeight;
}

async function setSeen(mensaje) {
  const seenMessage = await fetchData({
    endpoint: api.mensajes.update,
    params: { _id: mensaje._id, seen_at: normalizeDate(new Date()) }
  });
}

const updateURL = id => {
  let currentId;
  if (location.href.indexOf("?") >= 0) {
    mode = "add";
    const paramsString = location.href.split("?")[1];
    if (paramsString.indexOf("to=") >= 0) {
      mode = "edit";
      currentId = new URL(location.href).searchParams.get("to");
    }
  } else {
    mode = "first";
  }
  let newURL = "";
  if (!id && mode === "edit") {
    mode = "empty";
    newURL = "/chat/";
  }
  if (id !== currentId) {
    switch (mode) {
      case "empty":
        window.history.replaceState({}, "", newURL);
        break;
      case "first":
      case "add":
        newURL = "?";
        newURL = `${newURL}to=${id}`;
        window.history.replaceState({}, "", newURL);
        break;
      case "edit":
        newURL = location.href
          .split("?")[1]
          .split(currentId)
          .join(id);
        window.history.replaceState({}, "", `?${newURL}`);
        break;
    }
  }
};
function addSeenListener(id) {
  notSeenIds.push(id);
  if (seenInterval) {
    clearInterval(seenInterval);
  }
  seenInterval = setInterval(async ids => {
    const messages = await fetchData({endpoint: api.mensajes.findBy, params: {_id_in: ids}});
    for (const message of messages) {
      const {_id, seen_at} = message;
      if (seen_at) {
        notSeenIds = notSeenIds.filter(v => v._id !== _id);
        if (["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(_id.split("")[0])) {
          selector = `#\\3${_id.split("")[0]} ${_id.substring(1, _id.length)}`;
        }
        const message = document.querySelector(selector);
        const icon = message.querySelector('i');
        icon.classList.add('blue-text');
        icon.innerHTML = 'done_all';
        if (!notSeenIds.length) {
          clearInterval(seenInterval);
        }
      }  
    }
    
  }, 1000, notSeenIds);
}