var GLOBAL_MUTATION_CALLBACK;

let Persona = {
  name: $('#name').val(),
  last: 'Vargas',
  tipoDoc: '3',
  vivo: true
};

$(document).ready(() =>{
  $('select').formSelect();  
  
  // por usar Materialize
  const mutationCallback = (previousModel, currentModel) => {
      M.updateTextFields();
      $('select').formSelect();
  };
  
  R.setMutationCallback(mutationCallback);

  // Inicialización
  R.init('Persona');

  $('#mutate').click(testMutation)
})

const testMutation = () => {
  R.mutate('Persona', {name: 'Nicolás', last: 'Verón', tipoDoc: 2, vivo: false});
}

