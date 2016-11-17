const Router = require('express').Router;
const BodyParser = require('body-parser');
const {Events, Calendar} = require('./data');
const moment = require('moment');
const Promise = require('bluebird');

const api = new Router();

api.use(BodyParser.json());

api.post('/water', function(req, res) {
  req.app.locals.forceWater = true;
  res.status(201).send("OK");
});

api.get('/events', function(req, res) {
  Events.forge()
  .orderBy('-created_at')
  .fetchPage({
    page: req.query.page || 0,
    pageSize: 8
  }).then((result) => {
    res.status(200).json(result);
  });
});

api.get('/calendar', function(req, res) {
  let today = moment().day();
  let now = moment().format("HHmm");

  Calendar.where(function(q) {
    q.where(function() {
      this.where('dow', '=', today).where('time', '>', now)
    }).orWhere('dow', '>', today);
  })
  .orderBy("dow")
  .orderBy("time")
  .fetchPage({
    pageSize: 8,
    page: 0
  })
  .then((response) => {
    res.status(200).json(response);
  })
});

api.post('/calendar', function(req, res) {
  let body = req.body.data;
  console.log(body);

  Promise.map(body.days, function(element, index) {
    if(element) {
      return Calendar.forge({
        dow: index + 1,
        time: moment(body.time, "HH:mm").format("HHmm")
      }).save()
      .then(() => { return true; })
      .catch((e) => { return false; });
    } else {
      return null;
    }
  }).then((result) => {
    let filtered = result.filter((el) => { return !!el });
    req.app.locals.websocket.emit('update_calendar');
    res.status((filtered.length) ? 200 : 401).json(filtered);
  });
});

module.exports = function(app) {
  app.use('/api/', api);
}
