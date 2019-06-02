/** Exports as a service: Para generar buscadores al vuelo sin iframes 
 * Paso 1. Crear un modal con div#{{collection}}_grid en el html que va a llamar al buscador
 * Paso 2. Crear un modal que funcione como preloader con el siguiente formato:
 * <div id="preloader_modal" class="modal">
 *  <div class="progress">
 *     <div class="indeterminate"></div>
 *  </div>
 *  </div>
 * Paso 3. Llamar a initFinder() con los datos de la colección y el selector del preloader (#preloader_modal).
 *  Si colección es null buscará la colección en el parametro collection de la URL.
 */

let MODAL_INSTANCES,
  FINDER_INSTANCES = [],
  currentCollection,
  exportButton = true;

const initPreloader = (selector) => {
  if (!MODAL_INSTANCES) {
    MODAL_INSTANCES = M.Modal.init(document.querySelectorAll(selector), {});
  }
  for (const instance of MODAL_INSTANCES) {
    instance.open();
  }
};

const stopPreloader = () => {
  for (const instance of MODAL_INSTANCES) {
    instance.close();
  }
};

const initFinder = async (collection, preloader_modal_selector) => {
  if (FINDER_INSTANCES.indexOf(`${collection}_grid`) >= 0) {
    return;
  }
  moment.locale('es');
  initPreloader(preloader_modal_selector);

  currentCollection = collection || new URLSearchParams(window.location.search).get('collection');
  exportButton = new URLSearchParams(window.location.search).get('export');

  if (exportButton === "true") {
    $(".export").click(exportData);
  } else {
    $(".export").addClass("hide");
  }


  if (!validExports[currentCollection]) {
    M.toast({
      html: "La información solicitada no está disponible.",
      displayLength: 4000
    });
    return;
  }
  let gridName = `${currentCollection}_grid`;
  const defaultGridName = `_grid`;
  $(`#${defaultGridName}`).attr('id', gridName);

  $(`#${gridName}`).height(calculateHeight($(`#${gridName}`)));

  let w2uiDataGrid = {
    name: gridName,
    header: validExports[currentCollection].displayName,
    show: {
      toolbar: true,
      footer: true,
      toolbarColumns: true,
      toolbarReload: false,
      searchAll: false,
    },
    multiSearch: true,
    // multiSelect: true,
    searches: validExports[currentCollection].searches,
    columns: validExports[currentCollection].columns,
    records: [],
  };
  w2uiDataGrid = await loadObject(currentCollection, w2uiDataGrid);
  $(`#${gridName}`).w2grid(w2uiDataGrid);
  w2ui[gridName].render();
  w2ui[gridName].refresh();
  FINDER_INSTANCES.push(gridName);
  stopPreloader(preloader_modal_selector);
}

const loadObject = async (location, w2uiDataGrid) => {
  endpoint = api[location]['all'];
  let data = await fetchData({
    endpoint
  });
  if (data.error) {
    api.common.errorHandler({endpoint, data});
    return w2uiDataGrid;
  }
  let i = 0;
  
  if (validExports[location]['preloader']){
    data = validExports[location]['preloader'](data);
  }
  for (let obj of data) {
    if (typeof obj === 'object') {
      obj.recid = ++i;
      w2uiDataGrid.records.push(obj);
    }
  }
  return w2uiDataGrid;
}

const calculateHeight = ($grid) => {
  return $grid.parent().parent().height() - $('.modal-footer').height() - $('.modal h4').height() - 100;
}

const exportData = () => {
  const gridName = `${currentCollection}_grid`
  recordsToExcel(gridName);
}

const recordsToExcel = (gridName) => {
  if (w2ui[gridName].records.length === 0) {
    M.toast({html: 'No hay registros para exportar.'});
    return;
  }
  let records = w2ui[gridName].getSelection().length > 1 ? w2ui[gridName].getSelection().map(v => w2ui[gridName].records.filter(v1 => v1.recid === v)[0]) : w2ui[gridName].records;
  records = normalizeRecords(records)
  w2ui[gridName].exportData(records, "xls", true);
}

const normalizeRecords = (records) => {
  let baseKeys = Object.keys(records[0]);
  for (const line of records) {
    const currentKeys = Object.keys(line);
    if (currentKeys.length !== baseKeys.length) {
      for (const currentKey of currentKeys) {
        if (baseKeys.indexOf(currentKey) === -1) {
         baseKeys.push(currentKey)
        }
      }
    }
  }

  for  (const rec of records) {
    for (const key of baseKeys) {
      rec[key] = rec[key] || '';
    }
  }
  return records;
}

const doNothing = () => {}; // for readability only.

const toCamelCase = (value) => {
  if (typeof value !== "string") return false;
  return value.split('').map((v, i) => i === 0 ? v.toUpperCase() : v).join('');
}

const preloaderConsultas = (data) => {
  let personasBuffer = {};
  let finalData = [];
  for (let consulta of data.reverse()) {
    if (consulta.persona && consulta.persona._id && !personasBuffer[consulta.persona._id]) {
      personasBuffer[consulta.persona._id] = true;
      consulta.persona = onLoadPersona(consulta.persona);
      consulta = cloneObjectInParent(consulta, 'persona');
      consulta.creadoPor = consulta.createdBy ? consulta.createdBy.username : '';
      consulta.modificadoPor = consulta.updatedBy ? consulta.updatedBy.username : '';
      consulta.fecha = new Date(consulta.fecha).toLocaleDateString('es-AR', {timezone: 'GMT-3'});
      consulta.fechaProximaConsulta = consulta.fechaProximaConsulta ? new Date(consulta.fechaProximaConsulta).toLocaleDateString('es-AR', {timezone: 'GMT-3'}) : '';
      delete consulta['0'];
      delete consulta['__v'];
      delete consulta['createdBy'];
      delete consulta['updatedBy'];
      finalData.push(consulta);
    }
  }
  return finalData.reverse();
}

const cloneObjectInParent = (parent, keyName) => {
  if (!parent[keyName] || typeof parent[keyName] !== 'object') {
    return parent;
  }
  const keys = Object.keys(parent[keyName])
  const prefix = `${keyName}_`;
  for (const key of keys) {
    if (typeof parent[keyName][key] !== 'object') {
      parent[`${prefix}${key}`] = parent[keyName][key];
    }
  }
  delete parent[keyName];
  return parent;
}

const onLoadPersona = (data) => {
  if (Array.isArray(data)) {
    for (let rec of data) {
      rec = cleanUpPersona(rec);
    }
  } else {
    data = cleanUpPersona(data)
  }
  return data;
}

const cleanUpPersona = (rec) => {
  rec.edad = rec.nacimiento ? moment(rec.nacimiento).fromNow(true) : '';
  rec.imc = rec.pesoKg && rec.alturaCm ? rec.pesoKg / Math.pow(rec.alturaCm/100,2) : '';
  rec.creadoPor = rec.createdBy && rec.createdBy.username ? rec.createdBy.username : '';
  rec.modificadoPor = rec.updatedBy && rec.updatedBy.username ? rec.updatedBy.username : '';
  delete rec['0'];
  delete rec['__v'];
  delete rec['createdBy'];
  delete rec['updatedBy'];
  return rec;
}

const validExports = {
  "personas": {
    "displayName": "Personas",
    "preloader": onLoadPersona,
    "searches": [
      { "field": "apellido", "caption": "Apellido", "type": "text" },
      { "field": "nombre", "caption": "Nombre", "type": "text" },
      { "field": "email", "caption": "Email", "type": "text"},
      { "field": "telefono", "caption": "Teléfono", "type": "int" },
      { "field": "_id", "caption": "ID ", "type": "text" }
    ],
    "columns": [
      { "field": "_id", "caption": "id", "size": "0%", "hidden": true}, 
      { "field": "apellido", "caption": "Apellido", "size": "20%", "sortable": false, 
        "render": (record) => {
          return `<a href = "/personas/?id=${record._id}">${record.apellido}</a>`;
        }
      },
      { "field": "nombre", "caption": "Nombre", "size": "20%", "sortable": true},
      { "field": "email", "caption": "Email", "size": "20%", "sortable": true},
      { "field": "telefono", "caption": "Teléfono", "size": "10%", "sortable": true},
      { "field": "primerConsulta", "caption": "Primer consulta", "type": "date", "format": "DD/MM/YYYY", "size": "20%", "sortable": true}
    ]
  },
  "users": {
    "displayName": "Usuarios",
    "searches": [
      { "field": "username", "caption": "Nombre", "type": "text" },
      { "field": "email", "caption": "Correo electrónico", "type": "text" },
      { "field": "confirmed", "caption": "Confirmado", "type": "enum", "options": {"items": ["true", "false"]}},
      { "field": "blocked", "caption": "Desactivado", "type": "enum", "options": {"items": ["true", "false"]}},
      { "field": "_id", "caption": "ID ", "type": "text" }
    ],
    "columns": [
      { "field": "username", "caption": "Nombre", "size": "30%", "sortable": true,
        "render": (record) => {
          return `<a href = "/usuarios/?id=${record._id}">${record.username}</a>`;
        }
      },
      { "field": "role.name", "caption": "Rol", "size": "30%", "sortable": true},
      { "field": "email", "caption": "Correo electrónico", "size": "30%", "sortable": true},
      { "field": "confirmed", "caption": "Confirmado", "size": "40%", "render": "toggle", "sortable": true},
      { "field": "blocked", "caption": "Desactivado", "size": "40%", "render": "toggle", "sortable": true}
    ]
  },
  "consultas": {
    "displayName": "Consultas",
    "preloader": preloaderConsultas,
    "searches": [
      { "field": "fecha", "caption": "Fecha", "type": "text"},
      { "field": "tos", "caption": "Nombre", "type": "boolean" },
      { "field": "dolorCalambre", "caption": "Email", "type": "text"},
      { "field": "expectoracion", "caption": "Teléfono", "type": "int" },
      { "field": "dolorPrecordial", "caption": "Teléfono", "type": "int" },
      { "field": "dificultadRespiratoria", "caption": "Teléfono", "type": "int" },
      { "field": "sueno", "caption": "Teléfono", "type": "int" },
      { "field": "piel", "caption": "Teléfono", "type": "int" },
      { "field": "_id", "caption": "ID ", "type": "text" }
    ],
    "columns": [
      { "field": "_id", "caption": "id", "size": "0%", "hidden": true}, 
      { "field": "fecha", "caption": "Fecha", "size": "10%", "type": "date", "format": "DD/MM/YYYY", "sortable": true},
      { "field": "persona_apellido", "caption": "Apellido", "size": "10%", "sortable": true},
      { "field": "persona_nombre", "caption": "Nombre", "size": "10%", "sortable": true},
      { "field": "tos", "caption": "Tos", "size": "2%", "sortable": true, "render": "toggle"},
      { "field": "dolorCalambre", "caption": "Calambre", "size": "2%", "sortable": true},
      { "field": "expectoracion", "caption": "Expectoración", "size": "2%", "sortable": true},
      { "field": "dolorPrecordial", "caption": "Dolor Precordial", "size": "2%", "sortable": true},
      { "field": "dificultadRespiratoria", "caption": "Dif. Resp.", "size": "2%", "sortable": true},
      { "field": "sueno", "caption": "Sueño", "size": "2%", "sortable": true},
      { "field": "piel", "caption": "Piel", "size": "2%", "sortable": true},
      { "field": "olfato", "caption": "Olfato", "size": "2%", "sortable": true},
      { "field": "dientes", "caption": "Dientes", "size": "2%", "sortable": true},
      { "field": "gusto", "caption": "Gusto", "size": "2%", "sortable": true},
      { "field": "claudicacionMi", "caption": "Clau. MI", "size": "2%", "sortable": true},
      { "field": "problemaPeso", "caption": "Prob. Peso", "size": "2%", "sortable": true},
      { "field": "tratamientoFarmacologico", "caption": "Tratam. Farm.", "size": "2%", "sortable": true},
      { "field": "cambiarVida", "caption": "Cambiar vida", "size": "2%", "sortable": true},
      { "field": "actividadManual", "caption": "Act. manual", "size": "2%", "sortable": true},
      { "field": "tiempoLibre", "caption": "Tiempo libre", "size": "2%", "sortable": true},
      { "field": "carteleria", "caption": "Carteleria", "size": "2%", "sortable": true},
      { "field": "compromerterse", "caption": "Comprometerse", "size": "2%", "sortable": true},
      { "field": "corte", "caption": "Corte", "size": "2%", "sortable": true},
      { "field": "desayuno", "caption": "Desayuno", "size": "2%", "sortable": true},
      { "field": "actividadFisica", "caption": "Act. Física", "size": "2%", "sortable": true},
      { "field": "agua", "caption": "Agua", "size": "2%", "sortable": true},
      { "field": "chicles", "caption": "Chicles", "size": "2%", "sortable": true},
      { "field": "zanahoriaManzana", "caption": "Zan.Manz.", "size": "2%", "sortable": true},
      { "field": "autoSinTabaco", "caption": "Auto sin", "size": "2%", "sortable": true},
      { "field": "casaSinTabaco", "caption": "Casa sin", "size": "2%", "sortable": true},
      { "field": "alimentacion", "caption": "Alimentacion", "size": "2%", "sortable": true},
      { "field": "cepilladoDiente", "caption": "Cepillado Diente", "size": "2%", "sortable": true},
      { "field": "banos", "caption": "Baños", "size": "2%", "sortable": true},
      { "field": "reuniones", "caption": "Reuniones", "size": "2%", "sortable": true},
      { "field": "cambioMarca", "caption": "Cambio marca", "size": "2%", "sortable": true},
      { "field": "otros", "caption": "Otros", "size": "2%", "sortable": true},
      { "field": "derivado", "caption": "Derivado", "size": "2%", "sortable": true},
      { "field": "derivadoMedico", "caption": "Der. Medico", "size": "2%", "sortable": true},
      { "field": "derivadoNotificacion", "caption": "Der. Notificacion", "size": "2%", "sortable": true},
      { "field": "fechaAbandonoCompromiso", "caption": "F. Compromiso", "size": "2%", "sortable": true},
      { "field": "fechaAbandonoEfectiva", "caption": "F. Efectiva", "size": "2%", "sortable": true},
      { "field": "fechaProximaConsulta", "caption": "F. Prox", "size": "2%", "sortable": true},
      { "field": "observacion", "caption": "Observacion", "size": "2%", "sortable": true},
      { "field": "createdAt", "caption": "F. Creacion", "size": "2%", "sortable": true},
      { "field": "updatedAt", "caption": "F. Actualiz", "size": "2%", "sortable": true},
    ]
  }
}