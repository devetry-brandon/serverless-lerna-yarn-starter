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
  return db.createTable('pre-fill-mappings', {
    columns: {
      id: {
        type: 'int',
        notNull: true,
        length: 11,
        primaryKey: true,
        autoIncrement: true
      },
      source: {
        type: 'string',
        notNull: true,
        length: 100
      },
      sourceField: {
        type: 'string',
        notNull: false,
        length: 255
      },
      targetField: {
        type: 'string',
        notNull: true,
        length: 255
      },
      defaultValue: {
        type: 'string',
        notNull: true,
        length: 255
      }
    }
  });
};

exports.down = function(db) {
  return db.dropTable('pre-fill-mappings');
};

exports._meta = {
  "version": 1
};
