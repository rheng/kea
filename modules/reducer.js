'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.createPersistentReducer = createPersistentReducer;
exports.createStructureReducer = createStructureReducer;

var _redux = require('redux');

var _reduxAct = require('redux-act');

function storageAvailable(type) {
  try {
    var storage = window[type];
    var x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return false;
  }
}

var storageCache = {};

function createPersistentReducer(actions, defaultValue, key) {
  if (storageAvailable('localStorage')) {
    var _ret = function () {
      var storage = window.localStorage;

      var value = storage[key] ? JSON.parse(storage[key]) : defaultValue;
      storageCache[key] = value;

      var reducer = (0, _reduxAct.createReducer)(actions, value);

      return {
        v: function v(state, payload) {
          var result = reducer(state, payload);
          if (storageCache[key] !== result) {
            storageCache[key] = result;
            storage[key] = JSON.stringify(result);
          }
          return result;
        }
      };
    }();

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  } else {
    return (0, _reduxAct.createReducer)(actions, defaultValue);
  }
}

function createStructureReducer(path, structure) {
  var reducers = {};

  Object.keys(structure).forEach(function (key) {
    var mapping = structure[key];
    if (typeof mapping.reducer === 'function') {
      reducers[key] = mapping.reducer;
    } else {
      reducers[key] = mapping.persist ? createPersistentReducer(mapping.reducer, mapping.value, path.join('.') + key) : (0, _reduxAct.createReducer)(mapping.reducer, mapping.value);
    }
  });

  return (0, _redux.combineReducers)(reducers);
}