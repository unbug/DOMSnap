var Util = require('./Util.js');
var SnapCache = require('./SnapCache.js');
var DB = require('./DB.js');

var DS,
  CONFIG = {},
  capId = 'DEFAULT_CAPTURE_ID',
  cache = new SnapCache(),
  snapDB;

/**
 *
 * DOMSnap(config,readyCallback)
 * Initialize DOMSnap
 *
 * @constructor
 * @param config - [optional]
 * @param {function} readyCallback - will be called when DOMSnap is ready
 * @returns {object} {{capture: capture, resume: resume, get: get, getAll: getAll, remove: remove, clear: clear}|*}
 * @example
 * //init DOMSnap
 * var DS = DOMSnap(function(){
 *   console.log('DOMSnap is ready');
 * });
 *
 * //capture snapshot html of #main
 * DS.capture('#main');
 * //capture with specified capture id
 * DS.capture('#main','my_id');
 *
 * //set the html of #main by it's captured snapshot html
 * DS.resume('#main');
 * //set by specified capture id
 * DS.resume('#main','my_id');
 */
function DOMSnap(config,readyCallback) {
  if(typeof config == 'function'){
    readyCallback = config;
  }else{
    Util.apply(CONFIG,config);
  }
  snapDB = new DB(CONFIG.DBName,function(){
    snapDB.getAll(function(rows){
      rows.forEach(function (key) {
        cache.set(key.selector, key.capture_id, key.htm);
      });
      readyCallback && readyCallback(DS);
    });
  });
  return DS;
}

function _id(id){
  return Util.isNil(id)? capId: id;
}

/**
 *
 * .capture(selector, id, html)
 * capture snapshot html of the element matches the selector and store the result with a capture id
 *
 * @function
 * @param {string} selector - selector of the element
 * @param {string} id - [optional]capture id, if html is not null set id to null to store html as the default snapshot
 * @param {string} html - [optional]snapshot html, set id to null to store html as the default snapshot
 * @returns {object} DOMSnap
 */
function capture(selector, id, html) {
  var htm = Util.isNil(html)?Util.html(selector):html;
  id = _id(id);
  cache.set(selector, id, htm);
  snapDB.add(selector, id, htm);
  return DS;
}

/**
 *
 * .resume(selector, id, fallback)
 * set the html of the element matches the selector [and capture id] by it's captured snapshot html
 *
 * @function
 * @param {string} selector - selector of the element
 * @param {string} id - [optional]capture id, the result will be the default snapshot if it's not specified
 * @param {function} fallback - [optional]a callback function, will be called if no snapshot matched
 * @returns {object} DOMSnap
 */
function resume(selector, id, fallback) {
  if(Util.isFunction(id)){
    fallback = id;
  }
  id = _id(id);
  var htm = get(selector, id);
  Util.html(selector, htm);
  fallback && Util.isNil(htm) && fallback();
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
  return cache.get(selector, id);
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
  return cache.get(selector);
}

/**
 *
 * .remove(selector, id)
 * remove the captured snapshot html of the element matches the selector [and capture id]
 *
 * @function
 * @param {string} selector - selector of the element
 * @param {string} id - [optional]capture id, will empty all snapshots if it's not specified
 * @returns {object} DOMSnap
 */
function remove(selector, id) {
  cache.del(selector, id);
  snapDB.delete(selector, id);
  return DS;
}

/**
 *
 * .clear()
 * clear all captured snapshots
 *
 * @function
 * @returns {object} DOMSnap
 */
function clear() {
  snapDB.deleteAll();
  cache.empty();
  return DS;
}

DS =  {
  capture: capture,
  resume: resume,
  get: get,
  getAll: getAll,
  remove: remove,
  clear: clear
};

window.DOMSnap = DOMSnap;
module.exports = DOMSnap;
