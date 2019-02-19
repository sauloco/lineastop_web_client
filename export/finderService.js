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
  FINDER_INSTANCES = [];

const initPreloader = (selector) => {
  if (!MODAL_INSTANCES) {
    MODAL_INSTANCES = M.Modal.init(document.querySelectorAll(selector), {});
  }
  for (const instance of MODAL_INSTANCES) {
    instance.open();
  }
};

const stopPreloader = (selector) => {
  for (const instance of MODAL_INSTANCES) {
    instance.close();
  }
};

const initFinder = async (collection, preloader_modal_selector) => {
  if (FINDER_INSTANCES.indexOf(`${collection}_grid`) >= 0) {
    return;
  }

  initPreloader(preloader_modal_selector); 
  const rawData = await fetch('/export/validExports.json');
  const data = await rawData.json();
  if (!data) {
    M.toast({html: "Atención no se encuentra disponible la información de verificación.", displayLength: 4000});
    return;
  }
  const validExports = data;
  
  if (!collection) {
    collection = new URLSearchParams(window.location.search).get('collection');
  }
  
  if (!validExports[collection]) {
    M.toast({html: "La información solicitada no está disponible.", displayLength: 4000});
    return;
  }
  let gridName = `${collection}_grid`;

  if (!$(`#${gridName}`).length) {
    gridName = `_grid`;
  }

  $(`#${gridName}`).height(calculateHeight($(`#${gridName}`)));

  let w2uiDataGrid = {
    name: gridName,
    header: validExports[collection].displayName,
    show: { 
      toolbar: true,
      footer: true,
      toolbarColumns: true,
      toolbarReload: false,
      searchAll: false,
    },
    multiSearch: true,
    // multiSelect: true,
    searches: validExports[collection].searches,
    columns: validExports[collection].columns,
    records: [],
  };
  w2uiDataGrid = await loadObject(collection, w2uiDataGrid);
  $(`#${gridName}`).w2grid(w2uiDataGrid);
  w2ui[gridName].render();
  w2ui[gridName].refresh();
  FINDER_INSTANCES.push(gridName);
  stopPreloader(preloader_modal_selector);
}

const loadObject = async (location, w2uiDataGrid) => {
  endpoint = api[location]['all'];
  const data = await fetchData({endpoint});
  let i = 0;
  for (let obj of data) {
    if (typeof obj === 'object'){
      obj.recid = ++i;
      w2uiDataGrid.records.push(obj);
    }
  }
  return w2uiDataGrid;
}

const calculateHeight = ($grid) => {
  return $grid.parent().parent().height() - $('.modal-footer').height() - $('.modal h4').height() - 100;
}