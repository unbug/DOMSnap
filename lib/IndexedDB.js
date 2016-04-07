var Util = require('./Util.js');

var indexedDB, IDBTransaction, IDBKeyRange;
indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
IDBTransaction = window.hasOwnProperty('webkitIndexedDB') ? window.webkitIDBTransaction : window.IDBTransaction;
IDBKeyRange = window.hasOwnProperty('webkitIndexedDB') ? window.webkitIDBKeyRange : window.IDBKeyRange;

module.exports = function (readyCallback) {
  var self = this,
    DB_NAME = 'DOMSnap_DB',
    DB_VERSION = 14,
    TB_NAME = 'Snap',
    request = indexedDB.open(DB_NAME, DB_VERSION),
    db;

  function onError(event) {
    if (typeof console !== "undefined") {
      console.error("An error occurred", event);
    }
  }

  function install() {
    if (db.objectStoreNames.contains(TB_NAME)) {
      db.deleteObjectStore(TB_NAME);
    }
    var objectStore = db.createObjectStore(TB_NAME, {keyPath: "id", autoIncrement: true});
    objectStore.createIndex("id", "id", { unique: true });
    objectStore.createIndex("selector", "selector", { unique: false });
    objectStore.createIndex("capture_id", "capture_id", { unique: false });
    objectStore.createIndex("scope", "scope", { unique: false });
    objectStore.createIndex("version", "version", { unique: false });
  }
  request.onsuccess = function (event) {
    var setVersionRequest;
    db = event.target.result;
    DB_VERSION = String(DB_VERSION);
    if (db.setVersion && DB_VERSION !== db.version) {
      setVersionRequest = db.setVersion(DB_VERSION);
      setVersionRequest.onsuccess = function () {
        install();
        setVersionRequest.result.oncomplete = function () {
          readyCallback && readyCallback(self);
        };
      };
    } else {
      readyCallback && readyCallback(self);
    }
  };
  request.onupgradeneeded = function (event) {
    db = event.target.result;
    install();
  };
  request.onerror = onError;

  this.add = function (selector, capture_id, htm, scope, version) {
    !Util.isNil(selector) && !Util.isNil(capture_id) && this.delete(selector, capture_id, scope, version, function() {
      var row = {
        'selector': selector,
        'capture_id': capture_id,
        'htm': htm,
        'scope': scope,
        'version': version,
        'create_date': new Date().getTime()
      }
      db.transaction([TB_NAME], IDBTransaction.READ_WRITE || 'readwrite')
        .objectStore(TB_NAME)
        .add(row)
        .onerror = onError;
    });
  }

  this.delete = function (selector, capture_id, scope, version, callback) {
    db.transaction([TB_NAME], IDBTransaction.READ_WRITE || 'readwrite')
    .objectStore(TB_NAME)
      .openCursor()
      .onsuccess = function(evt) {
        var cursor = evt.target.result,
          key;
        if(!cursor){
          callback && callback();
          return;
        }
        key = cursor.value;
        if(key.selector==selector
          && key.capture_id==capture_id
          && key.scope==scope
          && key.version==version){
            cursor.delete();
        }
        cursor.continue();
    };
  }

  this.getAll = function (scope, version, callback) {
    var results = [];
    db.transaction([TB_NAME], IDBTransaction.READ_ONLY || 'readonly')
      .objectStore(TB_NAME)
      .openCursor()
      .onsuccess = function (event) {
        var cursor = event.target.result,
          key;
        if (!cursor) {
          callback(results);
          return;
        }
        key = cursor.value;
        if(key.scope==scope
          && key.version==version){
            results.push(cursor.value);
        }
        cursor.continue();
      };
  }

  this.deleteAll = function (scope, version) {
    db.transaction([TB_NAME], IDBTransaction.READ_WRITE || 'readwrite')
      .objectStore(TB_NAME)
      .openCursor()
      .onsuccess = function(evt) {
        var cursor = evt.target.result,
          key;
        if(!cursor){
          return;
        }
        key = cursor.value;
        if(key.scope==scope
          && key.version==version){
            cursor.delete();
        }
        cursor.continue();
    };
  }
}
