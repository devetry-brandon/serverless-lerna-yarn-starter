'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.createTable('templates', {
    columns: {
      id: {
        type: 'int',
        notNull: true,
        length: 11,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: 'string',
        notNull: true,
        length: 255
      },
      adobeSignId: {
        type: 'string',
        notNull: true,
        length: 50
      }
    }
  });
};

exports.down = function(db) {
  return db.dropTable('templates');
};

exports._meta = {
  "version": 1
};
