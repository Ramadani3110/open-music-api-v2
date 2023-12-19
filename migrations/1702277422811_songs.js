/* eslint-disable comma-dangle */
/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("songs", {
    id: {
      type: "VARCHAR(50)",
      notNull: true,
      primaryKey: true,
    },
    title: {
      type: "VARCHAR(80)",
      notNull: true,
    },
    year: {
      type: "INTEGER",
      notNull: true,
    },
    performer: {
      type: "VARCHAR(80)",
      notNull: true,
    },
    genre: {
      type: "VARCHAR(80)",
      notNull: true,
    },
    duration: {
      type: "INTEGER",
      notNull: false,
    },
    albumId: {
      type: "VARCHAR(50)",
      notNull: false,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("songs");
};
