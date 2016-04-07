/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var Util = __webpack_require__(1);
	var Memory = __webpack_require__(3);
	var Watcher = __webpack_require__(4);
	var IndexedDB = __webpack_require__(2);
	var WebSQL = __webpack_require__(5);

	var DS,
	  CONFIG,
	  capId = 'DEFAULT_CAPTURE_ID',
	  oMemory = new Memory(),
	  oWatcher = new Watcher(),
	  oDB,
	  inited;

	CONFIG = {
	  storeType: null,
	  scope: 'path',
	  version: 1
	};


	function _id(id){
	  return Util.isNil(id)? capId: id;
	}

	function _str(val){
	  return Util.isFunction(val)? val.apply(this,[].slice.call(arguments, 1)): val;
	}

	function _scope(val){
	  var location = window.location,
	    host = location.host,
	    path = host+location.pathname;
	  if(/^host$/ig.test(val)){
	    return host;
	  }
	  else if(/^path$/ig.test(val) || Util.isNil(val)){
	    return path;
	  }else{
	    return val;
	  }
	}

	/**
	 *
	 * DOMSnap(config)
	 * Initialize DOMSnap
	 *
	 * @constructor
	 * @param {object} config - [optional]
	 * @param {function} config.onReady  - will be called when DOMSnap is ready
	 * @param {number} config.version  - Version control, Nonzero. Update is required if web app has been updated. Default is 1
	 * @param {string} config.scope  - "host|path|or any string value".  "host": location.host; "path": location.host+location.pathname; default is "path"
	 * @param {string} config.storeType  - Data store to use. "IndexedDB" or "WebSQL", if not defined, use "WebSQL" for iOS and "IndexedDB" for others.
	 * @returns {object} {{capture: capture, resume: resume, get: get, getAll: getAll, remove: remove, clear: clear}|*}
	 * @example
	 * //init DOMSnap
	 * var DS = DOMSnap({
	 *   onReady: function(){
	 *     console.log('DOMSnap is ready');
	 *   }
	 * });
	 *
	 * //capture snapshot html of #main
	 * DS.capture('#main');
	 * //capture with specified capture id
	 * DS.capture('#main', {id: 'my_id'});
	 *
	 * //set the html of #main by it's captured snapshot html
	 * DS.resume('#main');
	 * //set by specified capture id
	 * DS.resume('#main',{id: 'my_id'});
	 */
	function DOMSnap(config) {
	  if(inited){return DS;}
	  inited = true;

	  Util.apply(CONFIG,config);
	  var DB = IndexedDB;
	  if(config.storeType == "WebSQL" || (!config.storeType && Util.os.ios)){
	    DB = WebSQL;
	  }
	  oDB = new DB(function(){
	    oDB.getAll(_scope(CONFIG.scope), CONFIG.version, function(rows){
	      rows.forEach(function (key) {
	        oMemory.set(key.selector, key.capture_id, key.htm);
	      });
	      CONFIG.onReady && CONFIG.onReady(DS);
	    });
	  });
	  return DS;
	}

	/**
	 *
	 * .capture(selector, options)
	 * capture snapshot html of the element matches the selector and store the result with a capture id
	 *
	 * @function
	 * @param {string} selector - selector of the element
	 * @param {object} options - [optional]
	 * @param {string|function} options.id - capture id, if html is not null set id to null to store html as the default snapshot
	 * @param {string|function} options.html - snapshot html, set id to null to store html as the default snapshot
	 * @returns {DOMSnap}
	 */
	function capture(selector, options) {
	  options = options || {};
	  var id,html;
	  id = Util.isNil(options.id)?_id(options.id):_str(options.id, selector);
	  html = Util.isNil(options.html)?Util.html(selector):_str(options.html, selector);
	  oMemory.set(selector, id, html);
	  oDB.add(selector, id, html, _scope(CONFIG.scope), CONFIG.version);
	  return DS;
	}

	/**
	 *
	 * .resume(selector, options)
	 * set the html of the element matches the selector [and capture id] by it's captured snapshot html
	 *
	 * @function
	 * @param {string} selector - selector of the element
	 * @param {object} options - [optional]
	 * @param {string|function} options.id - capture id, if html is not null set id to null to store html as the default snapshot
	 * @param {function} options.fallback - a callback function, will be called if no snapshot matched
	 * @returns {DOMSnap}
	 */
	function resume(selector, options) {
	  options = options || {};
	  var id, html;
	  id = Util.isNil(options.id)?_id(options.id):_str(options.id, selector);
	  html = get(selector, id);
	  Util.html(selector, html);
	  options.fallback && Util.isNil(html) && options.fallback();
	  return DS;
	}

	/**
	 * .watch(selector, options)
	 * watch and auto capture the element matches the selector
	 * @param {string|array} selector - selector[s] of the element[s]
	 * @param {object} options - [optional]
	 * @param {string|function} options.id - capture id
	 * @param {string|function} options.html - snapshot html
	 * @example
	 * //e.g.1
	 * DS.watch('#main');
	 *
	 * //e.g.2
	 * DS.watch('#main',{
	 *   id: 'my_capture_id',//capture id
	 *   html: 'my_snapshot_html'//snapshot html
	 * });
	 *
	 * //e.g.3
	 * DS.watch('#main',{
	 *   id: function(selector){ return 'generated_capture_id_for_'+selector;}, //return capture id
	 *   html: function(selector){ return 'generated_snapshot_html_for_'+selector;} //return snapshot html
	 * });
	 *
	 * //e.g.4
	 * DS.watch(['#main', '#another']);//watch multi elements
	 * @returns {DOMSnap}
	 */
	function watch(selector, options) {
	  options = options || {};
	  var selectors = Util.isArray(selector)?selector:[selector];
	  selectors.forEach(function(key){
	    oWatcher.watch(key,function(){
	      capture(key, {
	        id: options.id,
	        html: options.html
	      });
	    });
	  });

	  return DS;
	}

	/**
	 * .get(selector, id)
	 * retrun the captured snapshot html of the element matches the selector and capture id
	 *
	 * @function
	 * @param {string} selector - selector of the element
	 * @param {string} id - [optional]capture id, the result be the default snapshot if it's not specified
	 * @returns {string} html
	 */
	function get(selector, id) {
	  return oMemory.get(selector, id);
	}

	/**
	 *
	 * .getAll(selector)
	 * retrun all the captured snapshots html of the element matches the selector
	 *
	 * @function
	 * @param {string} selector - selector of the element
	 * @returns {object} all snapshots as object - e.g. {DEFAULT_CAPTURE_ID: 'html of DEFAULT_CAPTURE', my_id: 'html of my_id'}
	 */
	function getAll(selector) {
	  return oMemory.get(selector);
	}

	/**
	 *
	 * .remove(selector, id)
	 * remove the captured snapshot html of the element matches the selector [and capture id]
	 *
	 * @function
	 * @param {string} selector - selector of the element
	 * @param {string} id - [optional]capture id, will empty all snapshots if it's not specified
	 * @returns {DOMSnap}
	 */
	function remove(selector, id) {
	  oMemory.del(selector, id);
	  oDB.delete(selector, id, _scope(CONFIG.scope), CONFIG.version);
	  return DS;
	}

	/**
	 *
	 * .clear(version)
	 * clear all captured snapshots
	 *
	 * @function
	 * @param {number} version - [optional]Same value as initialize DOMSnap if it's not specified.
	 * @returns {DOMSnap}
	 */
	function clear(version) {
	  if(Util.isNil(version) || version == CONFIG.version){
	    oMemory.empty();
	  }
	  oDB.deleteAll(_scope(CONFIG.scope), version || CONFIG.version);
	  return DS;
	}

	DS =  {
	  capture: capture,
	  resume: resume,
	  watch: watch,
	  get: get,
	  getAll: getAll,
	  remove: remove,
	  clear: clear
	};

	window.DOMSnap = DOMSnap;
	module.exports = DOMSnap;


/***/ },
/* 1 */
/***/ function(module, exports) {

	var ua = navigator.userAgent,
	  android = ua.match(/(Android);?[\s\/]+([\d.]+)?/),
	  ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
	  ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/),
	  iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
	  os = {};

	if (android) os.android = true, os.version = android[2];
	if (iphone && !ipod) os.ios = os.iphone = true, os.version = iphone[2].replace(/_/g, '.')
	if (ipad) os.ios = os.ipad = true, os.version = ipad[2].replace(/_/g, '.')
	if (ipod) os.ios = os.ipod = true, os.version = ipod[3] ? ipod[3].replace(/_/g, '.') : null;

	function isNil(val) {
	  return val==undefined || val == null || val==false;
	}

	function isFunction(val) {
	  return typeof val=='function';
	}

	function isArray(val) {
	  return toString.call(val) === '[object Array]';
	}

	function apply(obj, config, promise) {
	  var conf = isFunction(config)?config.call(obj):config;
	  if (conf) {
	    var attr;
	    for (attr in conf) {
	      obj[attr] = promise ? promise(conf[attr]) : conf[attr];
	    }
	  }
	}

	function el(selector){
	  return document.querySelector(selector);
	}

	function html(selector, htm){
	  var ele = el(selector);
	  return isNil(htm)?ele.innerHTML:(ele.innerHTML = htm);
	}

	exports.os = os;
	exports.isNil = isNil;
	exports.isFunction = isFunction;
	exports.isArray = isArray;
	exports.apply = apply;
	exports.el = el;
	exports.html = html;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var Util = __webpack_require__(1);

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


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var Util = __webpack_require__(1);

	function Memory() {
	  var cache = {};

	  this.get = function (id,childId) {
	    return cache[id]
	      ?(Util.isNil(childId)
	        ?cache[id]
	        :cache[id][childId])
	      :null;
	  }

	  this.set = function(id,childId,body){
	    if(!Util.isNil(id) && !Util.isNil(childId) && !Util.isNil(body)){
	      cache[id] = cache[id] || {};
	      cache[id][childId] = body;
	    }
	  }

	  this.del = function (id,childId) {
	    if(cache[id]){
	      if(Util.isNil(childId)){
	        cache[id] = null;
	        delete cache[id];
	      }else{
	        cache[id][childId] = null;
	        delete cache[id][childId];
	      }
	    }
	  }

	  this.empty = function() {
	    cache = {};
	  }
	}
	module.exports = Memory;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var Util = __webpack_require__(1);
	var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

	function Watcher() {
	  var observes = {};

	  function add(id,observer){
	    del(id);
	    observes[id] = observer;
	  }

	  function del(id) {
	    var observer = observes[id];
	    if(observer){
	      observer.disconnect();
	      observes[id] = null;
	      delete observes[id];
	    }
	  }

	  function genObserver(selector, mutationCallback){
	    return new MutationObserver(mutationCallback)
	      .observe(Util.el(selector), {
	        attributes: true,
	        childList: true,
	        characterData: true,
	        subtree: true
	      });
	  }

	  this.watch = function (selector, mutationCallback) {
	    add(selector, genObserver(selector, mutationCallback));
	  }

	  this.unwatch = function (selector) {
	    del(selector);
	  }
	}
	module.exports = Watcher;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var Util = __webpack_require__(1);

	module.exports = function (readyCallback) {
	  var DB_NAME = 'DOMSnap_DB',
	    DB_VERSION = 13,
	    TB_NAME = 'Snap',
	    db;

	  try {
	    db = openDatabase(DB_NAME, DB_VERSION, DB_NAME, (5 * 1024 * 1024));
	    exe("CREATE TABLE IF NOT EXISTS "+
	      TB_NAME+
	      "(id INTEGER PRIMARY KEY ASC, " +
	      "create_date TIMESTAMP, " +
	      "selector TEXT, " +
	      "capture_id TEXT, " +
	      "scope TEXT, " +
	      "version INTEGER, " +
	      "htm TEXT)",
	      [], false, readyCallback);
	  } catch (e) {
	    console.log("WebSQL error: ", e);
	  }

	  function exe(query, data, returnFirst, callback) {
	    var i, l, remaining;

	    if (!(data[0] instanceof Array)) {
	      data = [data];
	    }

	    remaining = data.length;

	    function innerSuccessCallback(tx, rs) {
	      var i, l, output = [];
	      remaining = remaining - 1;
	      if (!remaining) {
	        // HACK Convert row object to an array to make our lives easier
	        for (i = 0, l = rs.rows.length; i < l; i = i + 1) {
	          output.push(rs.rows.item(i));
	        }
	        if (callback) {
	          callback(returnFirst ? output[0] : output);
	        }
	      }
	    }

	    function errorCallback(tx, e) {
	      if (typeof console !== "undefined") {
	        console.log("WebSQL error: ", tx, e);
	      }
	    }

	    db.transaction(function (tx) {
	      for (i = 0, l = data.length; i < l; i = i + 1) {
	        tx.executeSql(query, data[i], innerSuccessCallback, errorCallback);
	      }
	    });
	  }

	  this.add = function (selector, capture_id, htm, scope, version) {
	    if(!Util.isNil(selector) && !Util.isNil(capture_id)){
	      this.delete(selector, capture_id, scope, version,function(){
	        exe("INSERT INTO "+TB_NAME+" (selector, capture_id, htm, scope, version, create_date) VALUES (?, ?, ?, ?, ?, ?);",
	          [selector+'', capture_id+'', htm+'', scope+'', version, new Date()],
	          false);
	      });
	    }
	  }

	  this.delete = function (selector, capture_id, scope, version, callback) {
	    exe("DELETE FROM "+TB_NAME+" WHERE selector = ? AND capture_id = ? AND scope = ? AND version = ?",
	      [selector+'', capture_id+'', scope+'', version],
	      false,
	      callback);
	  }

	  this.getAll = function (scope, version, callback) {
	    exe("SELECT * FROM "+TB_NAME+" WHERE scope = ? AND version = ?",
	      [scope, version],
	      false,
	      callback);
	  }

	  this.deleteAll = function (scope, version) {
	    exe("DELETE FROM "+TB_NAME+" WHERE scope = ? AND version = ?",
	      [scope, version]);
	  }
	}


/***/ }
/******/ ]);