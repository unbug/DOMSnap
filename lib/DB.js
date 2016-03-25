var Util = require('./Util.js');
var lovefield = require('lovefield');
var lf = lf || lovefield;

module.exports = function (name,callback){
  var schemaBuilder = lf.schema.create(name||'DOMSnap_DB', 3),
    DB,Table;

  schemaBuilder
    .createTable('Snap')
    .addColumn('id', lf.Type.INTEGER)
    .addColumn('selector', lf.Type.STRING)
    .addColumn('capture_id', lf.Type.STRING)
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

  this.add = function (selector, capture_id, htm) {
    !Util.isNil(selector) && !Util.isNil(capture_id) && this.delete(selector, capture_id,function(){
      var row = Table.createRow({
        'selector': selector,
        'capture_id': capture_id,
        'htm': htm,
        'create': new Date()
      });
      DB.insertOrReplace().into(Table).values([row])
        .exec();
    });
  }

  this.delete = function (selector, capture_id, callback) {
    DB.delete()
      .from(Table)
      .where(lf.op.and(
        Table.selector.eq(selector),
        Table.capture_id.eq(capture_id)
      ))
      .exec().then(function () {
      callback && callback();
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

  this.deleteAll = function () {
    DB.delete()
      .from(Table)
      .exec();
  }
}
