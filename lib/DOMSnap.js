var Util = require('./Util.js');
var SnapCache = require('./SnapCache.js');
var Watcher = require('./Watcher.js');
var DB = require('./DB.js');

var DS,
  CONFIG,
  capId = 'DEFAULT_CAPTURE_ID',
  oSnapCache = new SnapCache(),
  oWatcher = new Watcher(),
  snapDB,
  inited;

CONFIG = {
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
 * @param {string} config.scope  - "host|path|or any string value". "host": location.host; "path": location.host+location.pathname; default is "path"
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
  snapDB = new DB(CONFIG.DBName,function(){
    snapDB.getAll(_scope(CONFIG.scope), CONFIG.version, function(rows){
      rows.forEach(function (key) {
        oSnapCache.set(key.selector, key.capture_id, key.htm);
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
  oSnapCache.set(selector, id, html);
  snapDB.add(selector, id, html, _scope(CONFIG.scope), CONFIG.version);
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
  return oSnapCache.get(selector, id);
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
  return oSnapCache.get(selector);
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
  oSnapCache.del(selector, id);
  snapDB.delete(selector, id, _scope(CONFIG.scope), CONFIG.version);
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
    oSnapCache.empty();
  }
  snapDB.deleteAll(_scope(CONFIG.scope), version || CONFIG.version);
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
