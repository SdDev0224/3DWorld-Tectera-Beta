var socketIO = require('socket.io');

var db;
var ai;

function initSocketIO(server, dbin, aiin) {
  // SocketIO server
  var io = socketIO.listen(server);
  db = dbin;
  ai = aiin;

  // Messages
  io.on('connection', function (socket) {
    // Join a room
    socket.on('join', (data) => {
      if (data.room == null) return;
      socket.join(data.room);
      console.log("Joined " + data.room, data);
      db.loadChatHistory(data.room, (history) => { socket.emit('history', history); });
    });

    // Send messages to all
    socket.on('message', (data) => {
      if (data.room == null) return;
      db.storeMessage(data.room, data.username, data.message);
      ai.sendMessage(io, db, data.room, data.username, data.message);
      io.to(data.room).emit('message', data);
    });

    // Send player details to all
    socket.on('player', (data) => {
      if (data.room == null) return;
      io.to(data.room).emit('player', data);
    });
  });

  // WebRTC connections
  io.sockets.on('connection', function (socket) {
    function log() {
      var array = ['Message from server:'];
      array.push.apply(array, arguments);
      socket.emit('log', array);
    }
    socket.on('message', function (message) {
      log('Client said: ', message);
      socket.broadcast.emit('message', message);
    });
    socket.on('create or join', function (room) {
      log('Received request to create or join room ' + room);
      // Create or join
      var clientsInRoom = io.sockets.adapter.rooms[room];
      var numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;
      if (numClients === 0) {
        socket.join(room);
        log('Client ID ' + socket.id + ' created room ' + room);
        socket.emit('created', room, socket.id);
      } else {
        log('Client ID ' + socket.id + ' joined room ' + room);
        io.sockets.in(room).emit('join', room);
        socket.join(room);
        socket.emit('joined', room, socket.id);
        io.sockets.in(room).emit('ready');
      }
      log('Room ' + room + ' now has ' + numClients + ' clients');
    });
    socket.on('ipaddr', function () {
      var ifaces = os.networkInterfaces();
      for (var dev in ifaces) {
        ifaces[dev].forEach(function (details) {
          if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
            socket.emit('ipaddr', details.address);
          }
        });
      }
    });
    socket.on('bye', function () {
      console.log('received bye');
    });
  });
}

module.exports = initSocketIO;
