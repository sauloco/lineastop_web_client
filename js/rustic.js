const Rustic = (() => {

  const clone = (object) => {
    return JSON.parse(JSON.stringify(object));
  };

  const init = (modelName) => {
    
    const model = eval(modelName);
    
    if (!model) return;
  
    const keys = Object.keys(model);
  
    for (const key of keys) {
      const interactDomObject = $(`#${key}`);
      
      $(interactDomObject).data('model', modelName);
      $(interactDomObject).change(function () {
        if (mutating) return false;  
        let data = {};
        if ($(this).attr('type') === 'checkbox') {
          data[$(this).attr('id')] = $(this).prop('checked');  
        } else {
          data[$(this).attr('id')] = $(this).val();
        }
        mutate($(this).data('model'), data);
      });
      let mutateData = {};
      mutateData[key] = model[key];
      mutate(modelName, mutateData, true);
    }

    if ($(`#${modelName}`)) {
      modelInspectors.push(modelName);
      inspectModel(modelName);
    }
  };

  let mutationCallback = () => {};

  let mutating = false;

  const mutate = (name, data, force) => {
    mutating = true;
    const model = eval(name);
    const prevModel = clone(model);
    if (!model || !data || JSON.stringify(model) === JSON.stringify(data)) {
      mutating = false;
      return false;
    } 
    if (!force) {
      if (!history.isPerforming()) {
        history.add({name, data: clone(model)});
      }
    }
    const keys = Object.keys(data);
    let changes = 0;
    let keySubscriptions = [];
    for (const key of keys) {
      if (force || !model[key] || model[key] !== data[key]) {
        
        model[key] = data[key];
        const interactDomObject = $(`#${key}`);
        
        setDomValue(interactDomObject, model, key);
        
        eval(`${name} = model`);

        const tempSubscriptions = subscriptions.search(name, key);
        for (const tempSubscription of tempSubscriptions) {
          keySubscriptions.push(tempSubscription);
        };

        changes++;
      }
    };
    
    inspectModel(name);

    for (const keySubscription of keySubscriptions) {
      keySubscription.callback({prevModel, model});
    }

    const modelSubscriptions = subscriptions.search(name);
    for (const modelSubscription of modelSubscriptions) {
      modelSubscription.callback({prevModel, model});
    }

    mutating = false;
    return changes !== 0;
  };

  const setDomValue = (domObject, model, key) => {
    
    $(domObject).val(model[key]);

    if ($(domObject).attr('type') === 'checkbox') {
      $(domObject).prop('checked', model[key]);
      return true;
    }

    if ($(domObject).attr('type') === 'radio') {
      $(`input:radio[name=${key}]`).filter(`[value="${model[key]}"]`).prop('checked', true);
      return true;
    }

    return true;
  };

  

  const inspectModel = (name, model) => {
    model = model || eval(name);
    if (modelInspectors.indexOf(name) >= 0) {
      $(`#${name}`).html(`${name} = ${JSON.stringify(model, null, 2)}`);
    }
  };
  
  const modelInspectors = [];
  subscriptions = (() => {
    let modelSubscriptions = [];

    const addSubscription = ({model, key, callback}) => {
      if (!model) return false;
      if (!callback) return false;

      return modelSubscriptions.push({id: modelSubscriptions.length, model, key, callback});
    }

    const stopSusbscription = id => {
      const previousLength = modelSubscriptions.length;
      modelSubscriptions = modelSubscriptions.filter(v => v.id !== id);
      return previousLength !== modelSubscriptions.length;
    }

    const searchSubscription = (model, key) => {
      if (key) {
        return modelSubscriptions.filter(v => v.model === model && v.key === key);
      }
      return modelSubscriptions.filter(v => v.model === model && !v.key);
      
    }
    return {
      add: addSubscription,
      stop: stopSusbscription,
      search: searchSubscription,
      subs: modelSubscriptions,
    }
  })();
  

  const history = (() => {
    let anteriorData = [];
    let posteriorData = [];

    const add = (model) => {
      if (!model) return false;
      anteriorData.push(clone(model));
      if (!performing) {
        posteriorData = [];
      }
      return true;
    };

    let performing = false;

    const isPerforming = () => {
      return performing;
    };

    const undo = () => {
      performing = true;
      if (!anteriorData.length) {
        performing = false;
        return false;
      }
      
      const {name, data} = anteriorData[anteriorData.length - 1];
      posteriorData.push({name, data: clone(eval(name))});
      mutate(name, data);
      anteriorData.pop();
      performing = false;
      return true;
    };

    const redo = () => {
      performing = true;
      if (!posteriorData.length) {
        performing = false;
        return false;
      }
      const {name, data} = posteriorData[posteriorData.length - 1];
      add({name, data: clone(eval(name))});
      R.mutate(name, data);
      posteriorData.pop();
      performing = false;
      return true;
    };

    const clear = () => {
      performing = true;
      anteriorData = [];
      posteriorData = [];
      performing = false;
    };

    return {
      clear,
      add,
      undo,
      redo,
      isPerforming,
    };

  })();

  const setMutationCallback = callback => {
    mutationCallback = callback;
  }

  return {
    h: history,
    init,
    history,
    mutate,
    setMutationCallback,
    s: subscriptions,
    subscriptions
  }
})();

// Aliases
const R = Rustic,
  undo = R.h.undo,
  redo = R.h.redo;
