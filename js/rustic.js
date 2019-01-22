const Rustic = {
  clone: (object) => {
    return JSON.parse(JSON.stringify(object));
  },
  mutationCallback: () => {},
  init: (modelName) => {
    const model = eval(modelName);
    Rh.clear();
    if (!model) return;
  
    const keys = Object.keys(model);
  
    for (const key of keys) {
      const interactDomObject = $(`#${key}`);
      
      $(interactDomObject).data('model', modelName);
      $(interactDomObject).change(function () {
        if (R.mutating) return false;  
        let data = {};
        if ($(this).attr('type') === 'checkbox') {
          data[$(this).attr('id')] = $(this).prop('checked');  
        } else {
          data[$(this).attr('id')] = $(this).val();
        }
        R.mutate($(this).data('model'), data);
      });
      let mutateData = {};
      mutateData[key] = model[key];
      R.mutate(modelName, mutateData, true);
    }

    if ($(`#${modelName}`)) {
      R.modelInspectors.push(modelName);
      R.inspectModel(modelName);
    }
  },
  mutating: false,
  mutate: (name, data, force) => {
    R.mutating = true;
    const model = eval(name);
    if (!model || !data || JSON.stringify(model) === JSON.stringify(data)) {
      R.mutating = false;
      return false;
    } 
  
    const keys = Object.keys(data);
    let changes = 0;
    for (const key of keys) {
      if (force || !model[key] || model[key] !== data[key]) {
        if (!Rh.performing) {
          Rh.add({name, data: R.clone(model)});
        }
        model[key] = data[key];
        const interactDomObject = $(`#${key}`);
        
        R.setValue(interactDomObject, model, key);
        
        eval(`${name} = model`);
        R.mutationCallback && R.mutationCallback(model, key, interactDomObject);
        changes++;
      }
    }
    
    R.inspectModel(name);

    

    R.mutating = false;
    return changes !== 0;
  },
  setValue: (domObject, model, key) => {
    if ($(domObject).prop('tagName') === 'SELECT') {
      $(domObject).val(model[key]);
      $(`${key} option[value=${model[key]}]`).prop('selected', true);
      $(domObject).change();
      return true;
    }
    
    if ($(domObject).attr('type') === 'checkbox') {
      $(domObject).prop('checked', model[key]);
      $(domObject).change();
      return true;
    }
    $(domObject).val(model[key]);
    return true;
  },
  inspectModel: (name, model) => {
    model = model || eval(name);
    if (R.modelInspectors.indexOf(name) >= 0) {
      $(`#${name}`).html(`${name} = ${JSON.stringify(model, null, 2)}`);
    }
  },
  modelInspectors: [],
  history: {
    anteriorData: [],
    posteriorData: [],
    add: (model) => {
      if (!model) return false;
      Rh.anteriorData.push(R.clone(model));
      if (!Rh.performing) {
        Rh.posteriorData = [];
      }
      return true;
    },
    performing: false,
    undo: () => {
      Rh.performing = true;
      if (!Rh.anteriorData.length) {
        Rh.performing = false;
        return false;
      }
      
      const {name, data} = Rh.anteriorData[Rh.anteriorData.length - 1];
      Rh.posteriorData.push({name, data: R.clone(eval(name))});
      R.mutate(name, data);
      Rh.anteriorData.pop();
      Rh.performing = false;
      return true;
    },
    redo: () => {
      Rh.performing = true;
      if (!Rh.posteriorData.length) {
        Rh.performing = false;
        return false;
      }
      const {name, data} = Rh.posteriorData[Rh.posteriorData.length - 1];
      Rh.add({name, data: R.clone(eval(name))});
      R.mutate(name, data);
      Rh.posteriorData.pop();
      Rh.performing = false;
      return true;
    },
    clear: () => {
      Rh.performing = true;
      Rh.anteriorData = [];
      Rh.posteriorData = [];
      Rh.performing = false;
    }
  }
}


// Aliases
const R = Rustic;
const Rh = Rustic.history;