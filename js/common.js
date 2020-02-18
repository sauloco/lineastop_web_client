const validarToken = async (token) => {
    token = token || getCookie('jwt') || new URL(location.href).searchParams.get('redirectTo') || '';
    if (!token) {
        if (location.href.indexOf('login') < 0) {
            location.href = `/login/?redirectTo=${encodeURIComponent(location.href)}`;
        }
    };
    const data = await fetchData({
        endpoint: api.users.me,
        token
    });
    try {
        if (location.href.indexOf('login') < 0) {
            if (data.error) {
                emptyCookies();
                location.href = `/login/?redirectTo=${encodeURIComponent(location.href)}`;
            }
        } else {
            if (!data.error) {
                const url = new URL(location.href);
                const redirectTo = url.searchParams.get('redirectTo');
                location.href = redirectTo ? decodeURIComponent(redirectTo) : '/';
            }
        }
    } catch (error) {
        emptyCookies();
        location.href = `/login/?redirectTo=${encodeURIComponent(location.href)}`;
    };
}
validarToken();
const emptyCookies = () => {
    setCookie({
        name: 'jwt',
        value: '',
        day: 0,
        force: true
      });
      setCookie({
        name: 'username',
        value: '',
        day: 0,
        force: true
      });
      setCookie({
        name: 'email',
        value: '',
        day: 0,
        force: true
      });
      setCookie({
        name: 'id',
        value: '',
        day: 0,
        force: true
      });
};

let yo;
let miAnonimo;
// document.addEventListener("DOMContentLoaded", startMessagesListener);
let alreadyNotified = [];

let messagesListener;
function startMessagesListener() {
  messagesListener = setInterval(getNewMessages, 5 * 1000);
}

async function getNewMessages(cb) {
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

  const newMessages = await fetchData({
    endpoint: api.mensajes.findBy,
    params: {
      sender_ne: miAnonimo._id,
      target_null: true,
      seen_at_null: true,
      _id_nin: alreadyNotified,
    }
  });
  const notifyMessages = newMessages.filter(m => !m.seen_at && m.sender !== null);
  if (notifyMessages.length) {
    if (location.href.indexOf("chat") >= 0) {
      if (!anonimosLoaded) {
        return;
      }
      const currentId = new URL(location.href).searchParams.get("to");
      notifyMessages.sort(function(a, b) {
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
      for (const message of notifyMessages) {
        if (message.sender) {
          if (currentId && currentId === message.sender._id) {
            renderReceivedMessage(message);
          } else {
            if (["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(message.sender._id.split("")[0])) {
              selector = `#\\3${message.sender._id.split("")[0]} ${message.sender._id.substring(1, message.sender._id.length)}`;
            }
            document.querySelector(selector).classList.add('hasMessages');
            alreadyNotified.push(message._id);
          }
        }
      }
    } else {
      let body = '';
      let title = 'Linea Stop';
      if (notifyMessages.length === 1) {
        body = `Tienes un nuevo mensaje de ${notifyMessages[0].sender_default_name}`;
      } else {
        const senders = notifyMessages.filter(v => v.sender).map(v => v.sender.pseudonimo ? v.sender.pseudonimo : v.sender.id).filter((v,i,a) => a.indexOf(v,i+1)<0);
        if (senders.length === 1) {
          from = senders[0];
        }
        else if (senders.length === 2) {
          from = senders.join(' y ');
        }
        else if (senders.length === 3) {
          from = `${senders[0]}, ${senders[1]} y ${senders[2]}`;
        }
        else {
          from = `${senders.filter((v,i) => i <= 3).join(', ')} y ${senders.length-3} más.`;
        }
        body = `Tienes ${notifyMessages.length} nuevos mensajes de ${from}`;
        
      }
      let onclick = evt => {
        evt.preventDefault()
        if (evt.data.to) {
          window.open(`${evt.data.url}/?to=${evt.data.to}`, '_blank');
        } else {
          window.open(`${evt.data.url}`, '_blank');
        }
      }
      const options = {
        onclick,
        icon: `${location.host}/favicon-16x16.png`,
        body,
        data: {
          url: `${location.host}/chat`,
          to: notifyMessages[0].sender ? notifyMessages[0].sender._id : ''
        }
      }
      
      
      for (const mensaje of notifyMessages) {
        alreadyNotified.push(mensaje._id);
      }

      if (!("Notification" in window)) {
        alert(`Este navegador no soporta notificaciones. ${message}`);
      }
      if (Notification.permission === "granted") {
        sendNotification(title, options);
      } else {
        Notification.requestPermission().then(function(permission) {
          sendNotification(title, options);
        });
      }
    }
  }
}

function sendNotification(mensaje, options) {
  if (options && Object.keys(options).length) {
    new Notification(mensaje, options);
  } else {
    new Notification(mensaje);
  } 
}