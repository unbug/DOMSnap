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
