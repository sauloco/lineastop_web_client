
$(document).ready(function(){
  onLoad();
});


const onLoad = () => {
  initializeGrid();
  $('#export').click(exportToExcel);
};

const initializeGrid = async () => {
  const rawData = await fetch('validExports.json');
  const data = await rawData.json();
  if (!data) {
    M.toast({html: "Atención no se encuentra disponible la información de verificación.", displayLength: 4000});
    return;
  }
  const validExports = data;
  const collection = new URLSearchParams(window.location.search).get('collection');

  if (!validExports[collection]) {
    M.toast({html: "La colección solicitada no es válida.", displayLength: 4000});
    return;
  }
  let w2uiDataGrid = {
    name: 'grid',
    header: validExports[collection].displayName,
    show: { 
      toolbar: true,
      footer: true,
      toolbarColumns: true,
      toolbarReload: false,
      searchAll: false,
    },
    multiSearch: true,
    multiSelect: true,
    searches: validExports[collection].searches,
    columns: validExports[collection].columns,
    records: [],
  };
  w2uiDataGrid = await loadObject(collection, w2uiDataGrid);
  $('#grid').w2grid(w2uiDataGrid);
  w2ui["grid"].render();
	w2ui["grid"].refresh();
}

const loadObject = async (location, w2uiDataGrid) => {
  const rawData = await fetch('https://hcdigital.herokuapp.com/'+location, {
    method:'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YzEzOThkNDQ0NjQ1NzEyNTgzNjBmNmYiLCJpYXQiOjE1NDUyNTA1NDIsImV4cCI6MTU0Nzg0MjU0Mn0.-eDSnZW15smd75g1TCuuNf9drVevm5m8KlRHIDSoeYQ"
    }
  });
  const data = await rawData.json();
  console.log('data', data);
  let i = 0;
  for (let obj of data) {
    if (typeof obj === 'object'){
      obj.recid = +i;
      w2uiDataGrid.records.push(obj);
    }
  }
  return w2uiDataGrid;
}

const exportToExcel = () => {
	let records = []
	
	if (w2ui["grid"].getSelection().length > 1) {
		records = w2ui["grid"].get(w2ui["grid"].getSelection())
	} else {
		records = w2ui["grid"].records
	}
	
	let table = $("<table/>")
	let thead = $("<thead/>")
	let tbody = $("<tbody/>")
	let th = $("<tr/>")
	
	let headerLabels = []
	$.each(records, function(index, value) {
		let tr = $("<tr/>")
		$.each(value, function(label, cell) {
			if (label == "recid"){
				return 
			}
	
			//Header
			if ($.inArray(label, headerLabels) == -1) {
				headerLabels.push(label)
				th.append("<th>" + label.trim() + "</th>")
			}
			
			//Content
			tr.append("<td>" + cell + "</td>")
		})
		tbody.append(tr)
	})
	thead.append(th)
	table.append(thead)
	table.append(tbody)
	
	$(table).table2excel({
	    // exclude CSS class
	    exclude: ".noExl",
	    name: "Worksheet Name",
	    filename: `${w2ui["grid"].header}.xls`
	})
	
}