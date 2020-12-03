document.querySelector("#button-enviar").addEventListener("click", enviar);
document.querySelector("#textarea1").addEventListener("keyup", onEnter);
document.addEventListener("DOMContentLoaded", getAllAnonimos);
document.addEventListener("DOMContentLoaded", initModal);
document.querySelector(".autocomplete").addEventListener("change", onSearch);

let ANONIMOS = {};

function onSearch(e) {
  const { target } = e;
  const { value } = target;
  if (ANONIMOS[value]) {
    const to = ANONIMOS[value];
    let selector = `#${to}`;
    if (
      ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(
        to[0]
      )
    ) {
      selector = `#\\3${to.split("")[0]} ${to.substring(1, to.length)}`;
    }
    cargarHistorial(document.querySelector(selector));
  }
}


function initModal() {
  const elems = document.querySelectorAll('.modal');
  const instances = M.Modal.init(elems, {});
}

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

function openModal(target) {
  const modalEl = document.querySelector('#imageVisor');
  const imageEl = modalEl.querySelector('img');
  const originEl = target.tagName === 'IMG' ? target : target.querySelector('img');
  imageEl.src = originEl.src;

  const modal = M.Modal.getInstance(modalEl);
  modal.open();
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
  const sentMessageHtml = renderSentMessage({
    created_at: fecha,
    body,
    _id: `m_${fecha.getTime()}`,
    sender: miAnonimo
  }, false);

  document.querySelector(".message-wrapper").innerHTML += sentMessageHtml;
  document.querySelector('.message-wrapper').scrollTop = document.querySelector('.message-wrapper').scrollHeight;
  
  const mensaje = await fetchData({
    endpoint: api.mensajes.create,
    params: {
      temp_id: fecha.getTime(),
      body,
      created_at: normalizeDateTime(fechaTexto),
      sender_default_name: miAnonimo.pseudonimo || yo.username,
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
    : (anonimo.pseudonimo || `zz_${ anonimo.id }`);
}

async function getAllAnonimos() {
  showLoader();
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
    document.querySelector(".message-wrapper").innerHTML = '';
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
  let tempHtml = '';
  for (const anonimo of anonimos) {
    tempHtml += createNewAnonItem(anonimo);
  }
  document.querySelector(".collection").innerHTML = tempHtml;
  $('input.autocomplete').autocomplete({
    data: autocompleteData
  });

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
  
  document.querySelector(".message-wrapper").innerHTML = '';
}
let autocompleteData = {};
function createNewAnonItem(anonimo) {
  const fullname = getNombreDeAnonimo(anonimo).split('zz_').join('');
  const imagen = anonimo.imagen
    ? `<img src="data:image/png;charset=utf-8;base64,${decodeURIComponent(anonimo.imagen)}" alt="${fullname}" title="${fullname}" onClick = "clickImage(this)" class="circle" height = "50px"></img>`
    : '';
  const correo = anonimo.email
    ? `<br><span><a href = "mailto:${anonimo.email}">${anonimo.email}</a></span>`
    : '';
  const anonimohtml = `<li id = "${anonimo._id}" class="collection-item avatar" onclick="cargarHistorial(this)">
      ${imagen}
      <span class="title">${fullname}</span>
      ${correo}
    </li>`;
  autocompleteData[fullname] = null;
  ANONIMOS[fullname] = anonimo._id;
  return anonimohtml;
}

function clickImage(target) {
  openModal(target);
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
  showLoader();

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
      // sender: miAnonimo._id, // string, id del usuario que tiene iniciada la sesión
      target: elemento.id // string, id usuario seleccionado en la barra lateral
    }
  });
  const mensajesRecibidos = await fetchData({
    endpoint: api.mensajes.findBy,
    params: {
      sender: elemento.id, // string, id usuario seleccionado en la barra lateral
    }
  });

  const respuestas = await fetchData({
    endpoint: api.respuestas.findBy,
    params: {
      anonimo: elemento.id
    }
  });
  alreadyResponses = respuestas.map(v => v._id);
  const receivedItems = mensajesEnviados.concat(mensajesRecibidos).concat(respuestas);
  receivedItems.sort(function(a, b) {
    const fechaA = a.created_at || a.createdAt;
    const fechaB = b.created_at || b.createdAt;
    if (fechaA > fechaB) {
      return 1;
    }
    if (fechaA < fechaB) {
      return -1;
    }
    return 0;
  });
  let tempHtml = '';
  if (receivedItems.length) {
    document.querySelector(".message-wrapper").innerHTML = ``;
    for (const item of receivedItems) {
      if (item.target && item.target._id === elemento.id) {
        tempHtml += renderSentMessage(item);
      } else {
        tempHtml += renderReceivedItem(item);
      }
    }
    document.querySelector(".message-wrapper").innerHTML = tempHtml;
    document.querySelector('.message-wrapper').scrollTop = document.querySelector('.message-wrapper').scrollHeight;
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

function showLoader() {
  const loader = `  <div class="progress">
                          <div class="indeterminate"></div>
                      </div>`;
  document.querySelector(".message-wrapper").innerHTML = loader;
}

function renderSentMessage(mensaje, startSeenListener = true) {
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
    attachments,
    image
  } = mensaje;
  let fecha = moment(created_at).toISOString();
  let readableDate = moment(created_at).fromNow();

  let icon = "alarm";
  if (sent_at) {
    fecha = moment(sent_at).toISOString();
    readableDate = moment(sent_at).fromNow();
    icon = "done";
  }
  let clase = "";
  if (seen_at) {
    clase = "blue-text";
    icon = "done_all";
  } else {
    if (startSeenListener) {
      addSeenListener(_id);
    }
  }
  const imageHTML = `<div class="card-image" onClick = "openModal(this)">
                      <img class="imageChat" src = "data:image/png;charset=utf-8;base64,${image}"/>
                    </div>`;

  let mensajehtml = `<div class = "row">
                <div class="col s10 m8 l6 offset-s2 offset-m4 offset-l5" id= "${_id}">
                  <div class="name">${sender._id === miAnonimo._id ? 'Tú' : (sender_default_name || sender.pseudonimo)}</div>                
                  ${!!image ? imageHTML : ''}
                  <div class="card-panel light-blue lighten-4">
                    <div class="mensaje">${body}</div>
                    <div class= "estatus">
                      <time datetime = "${fecha}" title="${displayDateTime(fecha)}">${readableDate}</time>
                      <i class="material-icons tiny ${clase}">${icon}</i>
                    </div>
                  </div>
                </div>
              </div>`;
  return mensajehtml;
  
}

function renderReceivedItem(item) {
  if (item.responses_csv) {
    return renderReceivedRespuesta(item);
  } else {
    return renderReceivedMessage(item);
  }
}

function capitalize(s) {
  return s[0].toUpperCase() + s.slice(1);
}

function renderReceivedRespuesta(respuesta) {

  const {
    _id,
    createdAt,
    display_name,
    responses_csv
  } = respuesta;

  let fecha = moment(createdAt).toISOString();
  let readableDate = moment(createdAt).fromNow();
  document.querySelector("#textarea1").value = "";
  
  let body = '';
  for (const [key, value] of Object.entries(JSON.parse(responses_csv))) {
    if (key === 'index') continue;
    if (display_name === "Fecha de abandono") {
      body = `${moment(value).format("DD/MM/YYYY")}. ${capitalize(moment(value).fromNow())}`; 
    } else {
      body = `${value}`;
    }
  }

  let mensajehtml = `<div class = "row">
                <div class="col s10 m8 l6 offset-l1" id= "${_id}">
                    <div class="card-panel purple lighten-4">
                  <div class="name">Respondió a la pregunta <b>${display_name}</b></div>
                    <div class="card-content">
                      
                      <div class="mensaje">${body}</div>
                      <div class= "estatus">
                        <time datetime = "${fecha}" title="${displayDateTime(fecha)}">${readableDate}</time>
                      </div>
                    </div>
                  </div>
                </div>
              </div>`;
  return mensajehtml;
}

function renderReceivedMessage(mensaje) {
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
    attachments,
    image
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
  const imageHTML = `<div class="card-image"  onClick = "openModal(this)">
                      <img class="imageChat" src = "data:image/png;charset=utf-8;base64,${image}"/>
                    </div>`;

  let mensajehtml = `<div class = "row">
                <div class="col s10 m8 l6 offset-l1" id= "${_id}">
                    <div class="card-panel white">
                  <div class="name">${name}</div>
                    ${!!image ? imageHTML : ''}
                    <div class="card-content">
                      
                      <div class="mensaje">${body}</div>
                      <div class= "estatus">
                        <time datetime = "${fecha}" title="${displayDateTime(fecha)}">${readableDate}</time>
                      </div>
                    </div>
                  </div>
                </div>
              </div>`;
  return mensajehtml;
}

async function setSeen(mensaje) {
  await fetchData({
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