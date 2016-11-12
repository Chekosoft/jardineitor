const Loki = require('lokijs');
const app = require('express')();

const db = new Loki('./db/arduino.json');

if(!db.getCollection('status')) {
  db.addCollection('status');
}

if(!db.getCollection('calendar')) {
  db.addCollection('calendar');
}

app.locals.db = db;
app.set('view engine', 'pug');

require('./arduino.js')(app);

app.listen(3389, '0.0.0.0', function() {
  console.log('listening to 3389 for all directions');
}); //DED
