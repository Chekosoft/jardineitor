const Router = require('express').Router;
const BodyParser = require('body-parser');
const {Events, Calendar} = require('./data');

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
    pageSize: 15
  }).then((result) => {
    res.status(200).json(result);
  });
});

api.post('/calendar', function(req, res) {

});

module.exports = function(app) {
  app.use('/api/', api);

  //FIXME: Remover después
  setInterval(function() {
    app.locals.websocket.emit('update_status', {
      light: Math.round(1023 * Math.random()),
      moist: Math.round(1023 * Math.random())
    });
  }, 2000);

}
