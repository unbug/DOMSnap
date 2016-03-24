var Util = require('./Util.js');
var DB = require('./DB.js');

/**
 * Offline web pages by persisting DOM to IndexedDB/WebSQL
 */

var DOMSnap,
  CONFIG = {},
  snapCache = {},
  snapDB;

function _$(cls){
  return document.querySelector(cls);
}
/**
 * retrun the captured snapshot html of the element matches the selector
 *
 * @param selector ,selector of the element
 * @returns html
 */
function get(selector) {
  return snapCache[selector];
}

/**
 *
 * remove the captured snapshot html of the element matches the selector
 *
 * @param selector ,selector of the element
 * @returns DOMSnap
 */
function remove(selector) {
  snapCache[selector] = null;
  delete snapCache[selector];
  snapDB.delete(selector);
  return DOMSnap;
}

/**
 *
 * capture snapshot html of the element matches the selector
 *
 * @param selector ,selector of the element
 * @returns DOMSnap
 */
function capture(selector) {
  var snap = _$(selector).innerHTML;
  snapCache[selector] = snap;
  snapDB.add(selector,snap);
  return DOMSnap;
}

/**
 *
 * set the html of the element matches the selector by it's captured snapshot html
 *
 * @param selector
 * @param fallback
 * @returns {*}
 */
function resume(selector,fallback) {
  var snap = get(selector);
  if(snap!==undefined || snap!==null){
    _$(selector).innerHTML = snap;
  }else{
    fallback && fallback();
  }
  return DOMSnap;
}

/**
 *
 * clear all captured snapshots
 *
 * @returns DOMSnap
 */
function clear() {
  snapDB.deleteAll();
  snapCache = {};
  return DOMSnap;
}

DOMSnap =  {
  get: get,
  remove: remove,
  capture: capture,
  resume: resume,
  clear: clear
};

function init(config,readyCallback) {
  if(typeof config == 'function'){
    readyCallback = config;
  }else{
    Util.apply(CONFIG,config);
  }
  snapDB = new DB(CONFIG.DBName,function(){
    snapDB.getAll(function(rows){
      rows.forEach(function (key) {
        snapCache[key.selector] = key.htm;
      });
      readyCallback && readyCallback(DOMSnap);
    });
  });
  return DOMSnap;
}

window.DOMSnap = init;
module.exports = init;
