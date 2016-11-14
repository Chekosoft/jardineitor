const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: './db/jardineitor.sqlite3'
  },
  useNullAsDefault: true
});

const bookshelf = require('bookshelf')(knex);
bookshelf.plugin('pagination');

knex.schema.createTableIfNotExists('calendar', function (table) {
  table.increments();
  table.integer('dow');
  table.time('time');
  table.timestamps();
}).then(() => {
  console.log('created calendar table');
});

knex.schema.createTableIfNotExists('events', function (table) {
  table.increments();
  table.enu('event', ['scheduled', 'emergency', 'forced', 'data']);
  table.timestamps();
}).then(() => {
  console.log('created events table');
});

const Calendar = bookshelf.Model.extend({
  tableName: 'calendar',
  hasTimestamps: true
});

const Events = bookshelf.Model.extend({
  tableName: 'events',
  hasTimestamps: true
});

module.exports = {
  Calendar, Events
};
