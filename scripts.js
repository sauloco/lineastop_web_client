$(document).ready(() => {
  moment.locale('es');
  getConsultas();
  historicoMensajesCreator();
  
})

let CONSULTAS = [];
let PREABANDONED = [];
let ABANDONED = [];
let PRECOMMITED = [];
let COMMITED = [];
let BIRTHDAYS = [];
let MONTHVERSARIES = []

const getConsultas = async () => {
  const consultas = await fetchData({endpoint: api.consultas.all, params: {_sort: "fecha:asc"}});
  if (consultas.error) {
    return api.common.errorHandler({endpoint: api.consultas.all, consultas});
  }
  CONSULTAS = consultas;
  let safeDate, safeDateTime;
  const timeServerURI = 'https://worldtimeapi.org/api/timezone/America/Argentina/Buenos_Aires';
  try {
    const response = await fetch(timeServerURI);
    safeDate = await response.json();
    safeDateTime = moment(safeDate.datetime);
  } catch (e) {
    safeDateTime = moment();
    console.warn(`Response not found from ${timeServerURI}, unsafe date got from the client.`, e.message);
    M.toast({html: 'Ocurrió un error conectando con el servidor de horario, asegúrese que el horario de su dispositivo sea correcto antes de continuar.'});
  }
  
  
  const filteredPerPerson = filterPerPerson(consultas);
  contactPeopleListCreator(filteredPerPerson);
  loadAbandon(filteredPerPerson, safeDateTime);
  loadCommitted(filteredPerPerson, safeDateTime);
  loadBirthday(filteredPerPerson, safeDateTime);
  loadMonthversary(filteredPerPerson, safeDateTime);
}

const filterPerPerson = (consultas) => {
  let personasBuffer = {};
  let finalData = [];
  consultas = consultas // todas las consultas en el orden que se guardaron
    .filter(v => v.persona) // me quedo solo con las que tienen una persona asociada
    .sort((a, b) => a.persona._id > b.persona._id) // ordeno por personas
    .reverse() // lo doy vuelta para que las ultimas consultas de cada persona queden primeras 
    .map(consulta => { // usando memoization saco solo la primera consulta de cada persona, como esta al reves es la ultima
      if (consulta.persona && consulta.persona._id && !personasBuffer[consulta.persona._id]) {
        personasBuffer[consulta.persona._id] = true;
        delete consulta['persona_id'];
        finalData.push(consulta);
      }
    });
  return finalData.reverse() // lo doy vuelta para que queden en el orden que van
}

const contactPeopleListCreator = async (consultas, date) => {
  date = date || moment();
  consultas = consultas
    .filter(v => // filtro solo las que van desde anteayer hasta dentro de 1 semana
      v.fechaProximaConsulta 
      && moment(v.fechaProximaConsulta).isSameOrAfter(initOfToday().subtract(2, 'days')) 
      && moment(v.fechaProximaConsulta).isSameOrBefore(moment(date).add(7, 'days').endOf('day'))
    );
  
  const wrapper = $('#aContactar');
  $(wrapper).html('');
  if (!consultas.length) {
    wrapper.append(`
    <li class="collection-item avatar">
      <i class="material-icons circle">cancel</i>
      <span class="title">No hay personas a contactar en los próximos días</span>
    </li>`);
  };
  if (consultas.length > 1) {
    consultas = consultas.sort((a, b) => a.fechaProximaConsulta.localeCompare(b.fechaProximaConsulta));
  }
  for (const consulta of consultas) {
    let when = humanReadableDate(moment(consulta.fechaProximaConsulta));
    if ((when === 'hoy'|| when === 'mañana') && consulta.horaProximaConsulta && consulta.horaProximaConsulta !== '00:00') {
      when += ` ${consulta.horaProximaConsulta} hs`;
    }
    wrapper.append(`
    <li class="collection-item avatar">
      <i class="material-icons blue circle">assignment</i>
      <span class="title">${consulta.persona.apellido} ${consulta.persona.nombre}</span>
      <p><label>${when.startsWith('hace') || when.startsWith('ayer') ? 'Pendiente de contacto' : 'Contactar'} ${when}</label></p>
      <a href="/consultas/?id=${consulta._id}" class="secondary-content"><i data-tooltip="Presiona para ir a la consulta" data-position="left" class="material-icons grey-text tooltiped">chevron_right</i></a>
    </li>`
    );
  }
}

const historicoMensajesCreator = async () => {
  const params = {enviado: false};
  let whatsapps = await fetchData({endpoint: api.whatsapps.findBy, params});
  let emails = await fetchData({endpoint: api.email.findBy, params});

  let data = [];
  const wrapper = $('#historicoMensajes');
  wrapper.html('');
  if (!whatsapps.error && !emails.error) {
    emails = emails.filter(v => !v.cancelado);
    whatsapps = whatsapps.filter(v => !v.cancelado);
    data = whatsapps.concat(emails);
  } else if (!whatsapps.error) {
    whatsapps = whatsapps.filter(v => !v.cancelado);
    data = whatsapps;
  } else if (!email.error) {
    emails = emails.filter(v => !v.cancelado);
    data = emails;
  }
  
  if (!data.length) {
    wrapper.append(`
    <li class="collection-item avatar">
      <i class="material-icons circle">cancel</i>
      <span class="title">No se han encontrado mensajes pendientes.</span>
    </li>`);
    historicoLoaded = true;
    return;
  }
  if (data.length > 1) {
    data = data.sort((a, b) => a.fechaEnvio.localeCompare(b.fechaEnvio));
  }
  // renderizar
  for (const idx in data) {
    let oldMessage = data[idx];
    if (!oldMessage) {
      continue;
    }
    oldMessage.tipo = oldMessage.subject ? 'email' : 'whatsapp';
    let title = '';
    if (oldMessage.persona && oldMessage.persona.apellido && oldMessage.persona.nombre) {
      title = `${oldMessage.persona.apellido} ${oldMessage.persona.nombre}`
    } else if (oldMessage.telefono) {
      title = `${oldMessage.telefono}`
    } else {
      wrapper.append(`<li class="collection-item avatar">
        <i class="material-icons circle">cancel</i>
        <span class="title">El mensaje programado tiene un error</span>
        <p><label>No se puede determinar el destinatario</label></p>
        <p><label>Se recomienda cancelarlo y reprogramarlo</label></p>
        <a onclick = "cancelMessage({tipo: '${oldMessage.tipo}', _id: '${oldMessage._id}'})" data-tooltip="Presiona para cancelar" data-position="left"  class="secondary-content tooltiped"><i class="material-icons grey-text">cancel</i></a>
      </li>`);
      continue;
    }
    const when = humanReadableDate(moment(oldMessage.fechaEnvio));
    wrapper.append(`
    <li class="collection-item avatar">
      <i data-tooltip="Presiona para enviar" onclick = "sendMessage({tipo: '${oldMessage.tipo}', _id: '${oldMessage._id}'})" data-position="left" class="material-icons circle tooltiped ${oldMessage.tipo === 'email'  ? 'blue">email' : 'green">call'}</i>
      <span class="title">${oldMessage.persona.apellido} ${oldMessage.persona.nombre}</span>
      <p><label>${when}</label></p>
      <a onclick = "cancelMessage({tipo: '${oldMessage.tipo}', _id: '${oldMessage._id}'})" data-tooltip="Presiona para cancelar" data-position="left" class="secondary-content tooltiped"><i class="material-icons grey-text">cancel</i></a>
    </li>`
    );
  }
  if (data.length) {
    $(".tooltiped").tooltip();
  }
}

const cancelMessage = ({tipo, _id}) => {
  if (tipo === 'whatsapp') {
    cancelWhatsapp(_id);
  } else {
    cancelEmail(_id);
  }
}

const sendMessage = ({tipo, _id}) => {
  if (tipo === 'whatsapp') {
    sendWhatsapp(_id);
  } else {
    sendEmail(_id);
  }
}

const sendWhatsapp = async (_id) => {
  if (!_id) {
    return M.toast({html: 'Ocurrió un error recuperando el mensaje. Contacte con el administrador del sistema'});
  }
  const params = {
    _id,
    enviado: true,
    fechaEnvio: normalizeDateTime(moment())
  }
  const data = await fetchData({endpoint: api.whatsapps.update, params});
  if (data.error) {
    return api.common.errorHandler({endpoint: api.whatsapps.update, data});
  }
  M.toast({html: 'El mensaje de Whatsapp se ha registrado como enviado, asegúrese de finalizar el envío en la pestaña abierta recientemente.'});
  let url = `https://api.whatsapp.com/send?phone=54${data.persona.telefono}&text=${encodeURIComponent(data.texto)}`;
  window.open(url);
  historicoMensajesCreator();
}

const sendEmail = async (_id) => {
  if (!_id) {
    return M.toast({html: 'Ocurrió un error recuperando el correo. Contacte con el administrador del sistema'});
  }
  let params = {
    _id,
    enviado: true,
    fechaEnvio: normalizeDateTime(moment())
  }
  let data = await fetchData({endpoint: api.email.update, params});
  if (data.error) {
    return api.common.errorHandler({endpoint: api.email.update, data});
  }
  params = {
    to: data.email,
    from: `Linea Stop <no.responder@lineastop.net>`,
    html: marked(data.texto),
    subject: data.subject,
    replyTo: `lineastop@gmail.com`
  };
  data = await fetchData({endpoint: api.email.send, params});
  if (data.error) {
    return api.common.errorHandler({endpoint: api.email.send, data});
  }
  M.toast({html: 'El correo electrónico se ha enviado y registrado satisfactoriamente.'});
  historicoMensajesCreator();
}

const cancelWhatsapp = async (_id) => {
  if (!_id) {
    return M.toast({html: 'Ocurrió un error recuperando el mensaje. Contacte con el administrador del sistema'});
  }
  const params = {
    _id,
    cancelado: true
  }
  const data = await fetchData({endpoint: api.whatsapps.update, params});
  if (data.error) {
    return api.common.errorHandler({endpoint: api.whatsapps.update, data});
  }
  M.toast({html: 'El mensaje de Whatsapp se ha cancelado.'});
  historicoMensajesCreator();
}

const cancelEmail = async (_id) => {
  if (!_id) {
    return M.toast({html: 'Ocurrió un error recuperando el mensaje. Contacte con el administrador del sistema'});
  }
  const params = {
    _id,
    cancelado: true
  }
  const data = await fetchData({endpoint: api.email.update, params});
  if (data.error) {
    return api.common.errorHandler({endpoint: api.email.update, data});
  }
  M.toast({html: 'El correo electrónico se ha cancelado.'});
  historicoMensajesCreator();
}

const loadAbandon = (consultas, date) => {
  date = date || moment();
  consultas = _.cloneDeep(consultas);
  document.querySelector('#abandonaron > div > span > strong').innerHTML = moment(date).subtract(1, 'months').format("MMMM");
  const preConsultas = consultas
  .filter(v => 
    v.fechaAbandonoEfectiva
    && moment(v.fechaAbandonoEfectiva).month() === moment(date).subtract(2, 'months').month()
  );
  consultas = consultas
  .filter(v => 
    v.fechaAbandonoEfectiva
    && moment(v.fechaAbandonoEfectiva).month() === moment(date).subtract(1, 'months').month()
    && moment(v.fechaAbandonoEfectiva).year() === moment(date).subtract(1, 'months').year()
  );
  const difference = consultas.length - preConsultas.length;
  let icon = `trending_flat`;
  let color = `white`;
  if (difference) {
    icon = `trending_${difference < 0 ? 'down' : 'up'}`;
    color = `${difference < 0 ? 'red' : 'green'}`;
  }
  document.querySelector('#abandonaron > div > h1').innerHTML = `${consultas.length}<i class = "material-icons ${color}-text medium tooltipped" data-tooltip = "${!difference ? " igual" : (difference < 0 ? difference * -1 + " menos" : difference + " más")} que ${moment().subtract(2, 'months').format('MMMM')}" data-position = "bottom">${icon}</i>`;
  document.querySelector('#abandonaron > div > a').addEventListener('click', seeAbandonedDetails);
  document.querySelector('#abandonaron > div > a.pre').addEventListener('click', seePreAbandonedDetails);
  PREABANDONED = preConsultas;
  ABANDONED = consultas;
  $('.tooltipped').tooltip();

}

const loadCommitted = (consultas, date) => {
  date = date || moment();
  consultas = _.cloneDeep(consultas);
  document.querySelector('#comprometidos > div > span > strong').innerHTML = moment(date).format("MMMM");
  const preConsultas = consultas
  .filter(v => 
    v.fechaAbandonoCompromiso
    && moment(v.fechaAbandonoCompromiso).month() === moment(date).subtract(1, 'months').month()
    && moment(v.fechaAbandonoCompromiso).year() === moment(date).subtract(1, 'months').year()
  );
  consultas = consultas
  .filter(v => 
    v.fechaAbandonoCompromiso
    && moment(v.fechaAbandonoCompromiso).month() === moment(date).month()
  );
  const difference = consultas.length - preConsultas.length;
  let icon = `trending_flat`;
  let color = `white`;
  if (difference) {
    icon = `trending_${difference < 0 ? 'down' : 'up'}`;
    color = `${difference < 0 ? 'red' : 'green'}`;
  }
  document.querySelector('#comprometidos > div > h1').innerHTML = `${consultas.length}<i class = "material-icons ${color}-text medium tooltipped" data-tooltip = "${difference < 0 ? difference * -1 + " menos" : difference + " más"} que ${moment().subtract(1, 'months').format('MMMM')}" data-position = "bottom">${icon}</i>`;
  document.querySelector('#comprometidos > div > a').addEventListener('click', seeCommitedDetails);
  document.querySelector('#comprometidos > div > a.pre').addEventListener('click', seePreCommitedDetails);
  PRECOMMITED = preConsultas;
  COMMITED = consultas;
  $('.tooltipped').tooltip();
}

const seePreCommitedDetails = () => {
  seeDetails(PRECOMMITED);
}

const seeCommitedDetails = () => {
  seeDetails(COMMITED);
}

const seePreAbandonedDetails = () => {
  seeDetails(PREABANDONED);
}

const seeAbandonedDetails = () => {
  seeDetails(ABANDONED);
}
const seeBirthdaysDetails = () => {
  seeDetails(BIRTHDAYS);
}
const seeMonthversaiesDetails = () => {
  seeDetails(MONTHVERSARIES);
}

const seeDetails = async (data) => {
  await initFinder({pattern: 'consultas', data: _.cloneDeep(data), export: true}, '#preloader_modal');
  
  M.Modal.init(document.querySelector('#details_modal'), {
    onOpenEnd: showExport,
    onCloseStart: hideExport
  });
  const modal = M.Modal.getInstance(document.querySelector('#details_modal'));
  modal.open();

}

const loadBirthday = (consultas, date) => {
  date = date || moment();
  consultas = _.cloneDeep(consultas);
  document.querySelector('#cumpleanos > div > span > strong').innerHTML = moment(date).format("MMMM");
  consultas = consultas
  .filter(v => 
    v.persona.nacimiento
    && moment(v.persona.nacimiento).month() === moment(date).month()
  );
  document.querySelector('#cumpleanos > div > h1').innerHTML = consultas.length;
  document.querySelector('#cumpleanos > div > a').addEventListener('click', seeBirthdaysDetails);
  BIRTHDAYS = consultas;
}

const loadMonthversary = (consultas, date) => {
  date = date || moment();
  consultas = _.cloneDeep(consultas);
  consultas = consultas
  .filter(v => 
    v.fechaAbandonoEfectiva
    && moment(v.fechaAbandonoEfectiva).date() === moment(date).date()
  );
  document.querySelector('#cumplemes > div > h1').innerHTML = consultas.length;
  document.querySelector('#cumplemes > div > a').addEventListener('click', seeMonthversaiesDetails);
  MONTHVERSARIES = consultas;
}