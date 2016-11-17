const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: './db/jardineitor.sqlite3'
  },
  useNullAsDefault: true,
  debug: true
});

const bookshelf = require('bookshelf')(knex);
bookshelf.plugin('pagination');

knex.schema.createTableIfNotExists('calendar', function (table) {
  table.increments();
  table.integer('dow');
  table.integer('time');
  table.timestamps();
  table.unique(['dow', 'time']);
}).then(() => {
  console.log('created calendar table');
}).catch((err) => {
  console.log({err});
});

knex.schema.createTableIfNotExists('events', function (table) {
  table.increments();
  table.enu('event', ['scheduled',
    'emergency',
    'forced',
    'too-little-light',
    'too-much-light',
    'too-much-moist']
  );
  table.timestamps();
}).then(() => {
  console.log('created events table');
});

knex.schema.createTableIfNotExists('sensors', function (table) {
  table.increments();
  table.enu('sensor', ['light', 'moist']);
  table.integer('value');
  table.timestamps();
}).then(() => {
  console.log('created sensors table');
});

const Calendar = bookshelf.Model.extend({
  tableName: 'calendar',
  hasTimestamps: true
});

const Events = bookshelf.Model.extend({
  tableName: 'events',
  hasTimestamps: true
});

const Sensor = bookshelf.Model.extend({
  tableName: 'sensors',
  hasTimestamps: true
});

module.exports = {
  Calendar, Events, Sensor
};
