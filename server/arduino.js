const Router = require('express').Router;
const BodyParser = require('body-parser');
const moment = require('moment');

const arduino = new Router();

arduino.use(BodyParser.text());

arduino.get('/', function(req, res) {
  res.status(200).send('OK');
});

arduino.post('/', function (req, res) {
  let db = req.app.locals.db;
  let statuses = db.getCollection('status');
  let body = req.body.split(';');

  db.insert({
    date: moment().toISOString(),
    action: body[0],
    light_avg: body[1],
    humid_avg: body[2]
  });

  res.status(201).end();
});

arduino.get('/water', function(req, res){
  let db = req.app.locals.db;
  let calendar = db.getCollection('calendar');
  let now = moment();
  let day = calendar.find({ day: now.day()});

  console.log(day);
  res.status(200).end();
});

module.exports = function(app) {
  app.use('/arduino', arduino);
}
