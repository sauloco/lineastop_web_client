const Rustic = (() => {

  const clone = (object) => {
    return JSON.parse(JSON.stringify(object));
  };

  const init = (modelName) => {

    const model = eval(modelName);

    if (!model) return;

    R.s.add({
      model: modelName,
      callback: ({
        prevModel,
        model
      }) => {
        $(`#${modelName}_inspector`).html(`${modelName} = ${JSON.stringify(model, null, 2)}`);
      }
    });

    const keys = Object.keys(model);

    for (const key of keys) {
      let interactDomObject = $(`[name=${key}]`);
      if (!interactDomObject.length) {
        interactDomObject = $(`#${key}`);
      }
      if (interactDomObject.length === 1) {
        initDomObject(interactDomObject, modelName, key);
      } else {
        for (const child of interactDomObject) {
          initDomObject(child, modelName, key);
        }
      }

    }
  };

  let mutating = false;

  const mutate = (modelName, data, force) => {
    mutating = true;
    const model = eval(modelName);
    const prevModel = clone(model);
    if (!model || !data || JSON.stringify(model) === JSON.stringify(data)) {
      mutating = false;
      return false;
    }
    if (!force) {
      if (!history.isPerforming()) {
        history.add({
          name: modelName,
          data: clone(model)
        });
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

        eval(`${modelName} = model`);

        const tempSubscriptions = subscriptions.search(modelName, key);
        for (const tempSubscription of tempSubscriptions) {
          keySubscriptions.push(tempSubscription);
        }

        changes++;
      }
    };

    for (const keySubscription of keySubscriptions) {
      keySubscription.callback({
        prevModel,
        model
      });
    }

    const modelSubscriptions = subscriptions.search(modelName);
    for (const modelSubscription of modelSubscriptions) {
      modelSubscription.callback({
        prevModel,
        model
      });
    }

    mutating = false;
    return changes !== 0;
  };

  const initDomObject = (domObject, modelName, key) => {
    const model = eval(modelName);
    $(domObject).data('model', modelName);
    $(domObject).change(function () {
      if (mutating) return false;
      let data = {};
      let domId = $(this).attr('id');
      if (Object.keys(model).indexOf(domId) < 0) {
        domId = $(this).attr('name');
      }
      if ($(this).attr('type') === 'checkbox') {
        data[domId] = $(this).prop('checked');
      } else {
        data[domId] = $(this).val();
      }
      mutate($(this).data('model'), data);
    });
    let mutateData = {};
    mutateData[key] = model[key];
    mutate(modelName, mutateData, true);
  };

  const setDomValue = (domObject, model, key) => {

    if (domObject.length) {

      $(domObject).val(model[key]);
      if ($(domObject).attr('type') === 'checkbox') {
        $(domObject).prop('checked', model[key]);
        return true;
      }

    } else {

      const domObjects = $(`[name=${key}]`);
      if (domObjects.length) {
        for (domObject of domObjects) {
          if ($(domObject).attr('type') === 'radio') {
            $(domObject).attr('checked', false);
          }
        }
        if (model[key]) {
          $(`input:radio[name=${key}]`).filter(`[value="${model[key]}"]`).prop('checked', true);
        }
        return true;
      }

    }


    return true;
  };
  subscriptions = (() => {
    let modelSubscriptions = [];

    const addSubscription = ({
      model,
      key,
      callback
    }) => {
      if (!model) return false;
      if (!callback) return false;

      return modelSubscriptions.push({
        id: modelSubscriptions.length,
        model,
        key,
        callback
      });
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

      const {
        name,
        data
      } = anteriorData[anteriorData.length - 1];
      posteriorData.push({
        name,
        data: clone(eval(name))
      });
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
      const {
        name,
        data
      } = posteriorData[posteriorData.length - 1];
      add({
        name,
        data: clone(eval(name))
      });
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
    subscriptions,
    clone // utilidad para clonar objetos sin quedar referenciado a su contenido.
  }
})();

// Aliases
const R = Rustic,
  undo = R.h.undo,
  redo = R.h.redo;