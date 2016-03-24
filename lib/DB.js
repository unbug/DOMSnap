var Util = require('./Util.js');
var lovefield = require('lovefield');
var lf = lf || lovefield;

module.exports = function (name,callback){
  var schemaBuilder = lf.schema.create(name||'DOMSnap_DB', 2),
    DB,Table;

  schemaBuilder
    .createTable('Snap')
    .addColumn('id', lf.Type.INTEGER)
    .addColumn('selector', lf.Type.STRING)
    .addColumn('htm', lf.Type.OBJECT)
    .addColumn('create', lf.Type.DATE_TIME)
    .addPrimaryKey(['id'], true);

  schemaBuilder.connect({
    storeType: Util.os.ios?lf.schema.DataStoreType.WEB_SQL: null
  }).then(function (db) {
    DB = db;
    Table = DB.getSchema().table('Snap');
    callback && callback();
  });

  this.add = function (selector, htm) {
    selector && this.delete(selector,function(){
      var row = Table.createRow({
        'selector': selector,
        'htm': htm,
        'create': new Date()
      });
      DB.insertOrReplace().into(Table).values([row])
        .exec();
    });
  }

  this.getBySelector = function (selector,callback) {
    DB.select().from(Table).where(Table.selector.eq(selector))
      .exec().then(function (rows) {
      callback && callback(rows);
    });
  }

  this.getAll = function (callback) {
    DB.select()
      .from(Table)
      .orderBy(Table.id, lf.Order.DESC)
      .exec().then(function (rows) {
      callback && callback(rows);
    });
  }
  this.delete = function (selector,callback) {
    DB.delete()
      .from(Table)
      .where(Table.selector.eq(selector))
      .exec().then(function () {
      callback && callback();
    });
  }

  this.deleteAll = function () {
    DB.delete()
      .from(Table)
      .exec();
  }
}
