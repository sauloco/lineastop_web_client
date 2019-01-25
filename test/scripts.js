var GLOBAL_MUTATION_CALLBACK;

let Persona = {
  name: 'Saulo',
  last: 'Vargas',
  tipoDoc: '3',
  vivo: true,
  cigarrillos: "6 o más",
};

$(document).ready(() =>{
  $('select').formSelect();  
  
  // por usar Materialize
  R.s.add({model: 'Persona', callback: ({previousModel, currentModel}) => {
    M.updateTextFields();
    $('select').formSelect();
  }});

  R.s.add({model: 'Persona', key: 'vivo', callback: ({prevModel, model}) => {
    if (model.vivo) {
      $("#isAlive").html(`${model.name} is alive!!`);
    } else {
      $("#isAlive").html(`${model.name} is dead :(`)
    }
  }});

  // Inicialización
  R.init('Persona');

  $('#mutate').click(testMutation)
})

const testMutation = () => {
  R.mutate('Persona', {name: 'Nicolás', last: 'Verón', tipoDoc: 2, vivo: false, cigarrillos: "0 a 3"});
}

const savePersona = () => {
  // TODO: send data to backend
}