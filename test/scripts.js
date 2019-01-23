let Persona = {
  name: $('#name').val(),
  last: 'Vargas',
  tipoDoc: '1',
  vivo: true
};

$(document).ready(() =>{
  R.init('Persona');

  // por usar Materialize
  R.mutationCallback = (m, k, domO) => {
      M.updateTextFields();
  }
})


// R.mutate('Persona', {name: 'Nicolás', last: 'Verón'});