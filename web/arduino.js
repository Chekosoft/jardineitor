const Router = require('express').Router;
const BodyParser = require('body-parser');
const moment = require('moment');
const Calendar = require('./data').Calendar;
const Events = require('./data').Events;

const arduino = new Router();

arduino.use(BodyParser.text());

arduino.get('/water', function(req, res){
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

module.exports = function(app) {
  app.use('/arduino', arduino);
}
