var Util = require('./Util.js');
var lovefield = require('lovefield');
var lf = lf || lovefield;

module.exports = function (name,callback){
  var schemaBuilder = lf.schema.create(name||'DOMSnap_DB', 5),
    DB,Table;

  schemaBuilder
    .createTable('Snap')
    .addColumn('id', lf.Type.INTEGER)
    .addColumn('selector', lf.Type.STRING)
    .addColumn('capture_id', lf.Type.STRING)
    .addColumn('htm', lf.Type.OBJECT)
    .addColumn('scope', lf.Type.STRING)
    .addColumn('version', lf.Type.INTEGER)
    .addColumn('create', lf.Type.DATE_TIME)
    .addPrimaryKey(['id'], true);

  schemaBuilder.connect({
    storeType: Util.os.ios?lf.schema.DataStoreType.WEB_SQL: null
  }).then(function (db) {
    DB = db;
    Table = DB.getSchema().table('Snap');
    callback && callback();
  });

  this.add = function (selector, capture_id, htm, scope, version) {
    !Util.isNil(selector) && !Util.isNil(capture_id) && this.delete(selector, capture_id, scope, version, function(){
      var row = Table.createRow({
        'selector': selector,
        'capture_id': capture_id,
        'htm': htm,
        'scope': scope,
        'version': version,
        'create': new Date()
      });
      DB.insertOrReplace().into(Table).values([row])
        .exec();
    });
  }

  this.delete = function (selector, capture_id, scope, version, callback) {
    DB.delete()
      .from(Table)
      .where(lf.op.and(
        Table.selector.eq(selector),
        Table.capture_id.eq(capture_id),
        Table.scope.eq(scope),
        Table.version.eq(version)
      ))
      .exec().then(function () {
        callback && callback();
      });
  }

  this.getAll = function (scope, version, callback) {
    DB.select()
      .from(Table)
      .where(lf.op.and(
        Table.scope.eq(scope),
        Table.version.eq(version)
      ))
      .orderBy(Table.id, lf.Order.DESC)
      .exec().then(function (rows) {
        callback && callback(rows);
      });
  }

  this.deleteAll = function (scope, version) {
    DB.delete()
      .from(Table)
      .where(lf.op.and(
        Table.scope.eq(scope),
        Table.version.eq(version)
      ))
      .exec();
  }
}
