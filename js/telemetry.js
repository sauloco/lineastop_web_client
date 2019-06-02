const DEBUG = true;
const SessionInit = new Date().getTime();

const Telemetry = {
  init: ({userDataCallback}) => {
    Telemetry.userDataCallback = userDataCallback;
    document.addEventListener('DOMContentLoaded', Telemetry.onLoad);
    
  },

  currentSession: [],

  defaultData(event) {
    const data = {
      time: new Date().getTime(),
      user: Telemetry.getUserData(),
      event,
      target: event.target,
    };
    Telemetry.currentSession.push(data);
    return data;
  },

  log: (...args) => {
    // Send them to the server

    if (DEBUG) {
      console.log('TELEMETRY', args);
    }
    
  },
  startListeners: () => {
    window.addEventListener('unload', Telemetry.onUnload);
    document.addEventListener('keypress', Telemetry.onKeypress);
    const inputs = document.querySelectorAll('input');
    for (const input of Array.from(inputs)) {
      input.addEventListener('focus', Telemetry.onInputFocus);
      input.addEventListener('click', Telemetry.onInputClick);
      input.addEventListener('blur', Telemetry.onInputBlur);
      input.addEventListener('keyup', Telemetry.onInputKeypress);
    }
  },

  onInputFocus: (evt) => {
    const data = Telemetry.defaultData(evt);
    Telemetry.log('Input focused', {data});
  },
  onInputClick: (evt) => {
    const data = Telemetry.defaultData(evt);
    Telemetry.log('Input clicked', {data});
  },
  onInputBlur: (evt) => {
    const data = Telemetry.defaultData(evt);
    Telemetry.log('Input blured', {data});
  },
  onInputKeypress: (evt) => {
    const data = Telemetry.defaultData(evt);
    Telemetry.log('Input key pressed on', {data});
  },

  onLoad: (evt) => {
    const data = Telemetry.defaultData(evt);
    data.initialTime = SessionInit;
    data.navigator = window.navigator;
    Telemetry.log('Session initiated', {data});
    window.addEventListener('load', Telemetry.onAvailable);
  },
  onAvailable: (evt) => {
    const data = Telemetry.defaultData(evt);
    data.waitingMs = data.time - Telemetry.currentSession[0].initialTime;
    data.waitingS = data.waitingMs / 1000;
    Telemetry.log('Document available', {data});
    Telemetry.startListeners();
  },
  onUnload: (evt) => {
    const data = Telemetry.defaultData(evt);
    Telemetry.log('Session finished', {data});
    document.removeEventListener('load');
    document.removeEventListener('unload');
  },
  onClickTouch: (evt) => {

  },
  getUserData: () => {
    if (Telemetry.userDataCallback === null) {
      console.error(`You need to set userDataCallback before get Telemetry information.`);
    }
    return Telemetry.userDataCallback();
  },
  userDataCallback: null
};

Telemetry.init({userDataCallback: () => {}});