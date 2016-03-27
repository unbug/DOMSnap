var Util = require('./Util.js');
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

  this.watch = function (selector, mutationCallback) {
    var observer = new MutationObserver(mutationCallback);
    observer.observe(Util.el(selector), {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true
    });

    add(selector, observer);
  }

  this.unwatch = function (selector) {
    del(selector);
  }
}
module.exports = Watcher;
