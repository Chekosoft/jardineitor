const Router = require('express').Router;
const BodyParser = require('body-parser');
const moment = require('moment');
const {Calendar, Events, Sensor} = require('./data');
const Promise = require('bluebird');
const _ = require('lodash');

const arduino = new Router();

function rawBody(req, res, next) {
  req.setEncoding('utf8');
  req.body = '';
  req.on('data', function(chunk) {
    req.body += chunk;
  });
  req.on('end', function() {
    next();
  });
}

arduino.use(rawBody);

arduino.get('/water', function(req, res) {
  if(req.app.locals.forceWater) {
    req.app.locals.forceWater = false;
    new Events({
      event: 'forced'
    }).save().then((model) => {
      req.app.locals.websocket.emit('new_event', {
        event: model
      });
      res.status(200).send('yes');
    }).catch((err) => {
      console.log(err);
      res.status(200).send('no');
    })
  } else {
    res.status(200).send('no');
  }
});

arduino.post('/status', function(req, res) {
  let body = req.body;
  let values = body.split(";");
  let lightValue = parseInt(values[0]);
  let moistValue = parseInt(values[1]);

  let sensorData = Sensor.collection().add([
    {sensor: 'light', value: lightValue},
    {sensor: 'moist', value: moistValue}
  ]);

  Promise.all(sensorData.invokeThen('save')).then(() => {
    return Sensor.forge().orderBy('-created_at').fetchPage({
      pageSize: 10,
      page: 0
    })
  }).then(function (results) {
    let lightSum = _.chain(results.models)
    .filter(function(o) { return o.attributes.sensor == 'light'})
    .map(function(o) { return o.attributes.value })
    .value();

    let lightAvg = ((_.reduce(lightSum, function(sum, n){ return sum + n; }, 0)) / lightSum.length) || 0;

    let moistSum = _.chain(results.models)
    .filter(function(o) { return o.attributes.sensor == 'moist'})
    .map(function(o) { return o.attributes.value })
    .value();

    console.log(lightSum, moistSum);

    let moistAvg = ((_.reduce(moistSum, function(sum, n){ return sum + n; }, 0)) / lightSum.length) || 0;

    req.app.locals.websocket.emit('update_status', {
      moist: moistAvg,
      light: lightAvg
    });

    req.app.locals.status = {
      moist: moistAvg,
      light: lightAvg
    }

    res.status(200).end();
  });
});


module.exports = function(app) {
  app.use('/arduino', arduino);

  Sensor.forge().orderBy('-created_at').fetchPage({
      pageSize: 5,
      page: 0
  }).then(function (results) {
    let lightSum = _.chain(results.models)
    .filter(function(o) { return o.attributes.sensor == 'light'})
    .map(function(o) { return o.attributes.value })
    .value();

    let lightAvg = ((_.reduce(lightSum, function(sum, n){ return sum + n; }, 0)) / lightSum.length) || 0;

    let moistSum = _.chain(results.models)
    .filter(function(o) { return o.attributes.sensor == 'moist'})
    .map(function(o) { return o.attributes.value })
    .value();

    let moistAvg = ((_.reduce(moistSum, function(sum, n){ return sum + n; }, 0)) / lightSum.length) || 0;

    app.locals.websocket.emit('update_status', {
      moist: moistAvg,
      light: lightAvg
    });

    app.locals.status = {
      moist: moistAvg,
      light: lightAvg
    }
  });
}
