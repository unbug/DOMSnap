var Util = require('./Util.js');

module.exports = function (readyCallback) {
  var self = this,
    DB_NAME = 'DOMSnap_DB',
    DB_VERSION = 19,
    TB_NAME = 'Snap',
    db;

  try {
    db = openDatabase(DB_NAME, "", DB_NAME, (5 * 1024 * 1024));
    var v = db.version;
    if(v != DB_VERSION){
      db.changeVersion(v, DB_VERSION, function(){
        exe("DROP TABLE " + TB_NAME, []);
        install();
      });
    }else{
      install();
    }
  } catch (e) {
    console.log("WebSQL error: ", e);
  }

  function install() {
    exe("CREATE TABLE IF NOT EXISTS "+
      TB_NAME+
      "(id INTEGER PRIMARY KEY ASC, " +
      "create_date TIMESTAMP, " +
      "selector TEXT, " +
      "capture_id TEXT, " +
      "scope TEXT, " +
      "version INTEGER, " +
      "expires INTEGER, " +
      "htm TEXT)",
      [], false, readyCallback);
  }

  function exe(query, data, returnFirst, callback, filter) {
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
          var item = rs.rows.item(i);
          if(Util.isFunction(filter)){
            filter(item) && output.push(item);
          }else{
            output.push(item);
          }
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

  this.add = function (selector, capture_id, htm, scope, version, expires) {
    if(!Util.isNil(selector) && !Util.isNil(capture_id)){
      this.delete(selector, capture_id, scope, version,function(){
        exe("INSERT INTO "+TB_NAME+" (selector, capture_id, htm, scope, version, create_date, expires) VALUES (?, ?, ?, ?, ?, ?, ?);",
          [selector+'', capture_id+'', htm+'', scope+'', version, new Date(), expires || 0],
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

  this.deleteById = function (id) {
    exe("DELETE FROM "+TB_NAME+" WHERE id = ?",
      [id],
      false);
  }

  this.getAll = function (scope, version, callback) {
    var now = new Date().getTime();
    exe("SELECT * FROM "+TB_NAME+" WHERE scope = ? AND version = ?",
      [scope, version],
      false,
      callback, function (key) {
        if(Util.isNil(key.expires) || (now - new Date(key.create_date).getTime())>(key.expires)){
          self.deleteById(key.id);
          return false;
        }
        return true;
      });
  }

  this.deleteAll = function (scope, version) {
    exe("DELETE FROM "+TB_NAME+" WHERE scope = ? AND version = ?",
      [scope, version]);
  }
}
