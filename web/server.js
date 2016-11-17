const app = require('express')();
const cors = require('cors');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const morgan = require('morgan');

app.locals.forceWater = false;
app.locals.websocket = io;
app.locals.status = {
  moist: 0,
  light: 0
};
app.use(cors());
app.use(morgan('dev'));

require('./api.js')(app);
require('./arduino.js')(app);

io.on('connect', function(client) {
  client.emit('update_status', {
    moist: app.locals.status.moist,
    light: app.locals.status.light
  })
});

server.listen(3389, function() {
  console.log('listening to 3389 for all directions');
});
