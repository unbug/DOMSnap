var Util = require('./Util.js');

function SnapCache() {
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
module.exports = SnapCache;
