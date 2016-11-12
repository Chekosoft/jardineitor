const Router = require('express').Router;

let client = new Router();

module.exports = function(app) {
  app.use('/', client);
}
