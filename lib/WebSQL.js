var Util = require('./Util.js');

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
