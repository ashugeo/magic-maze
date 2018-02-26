const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname + '/'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
    console.log('user ' + socket.id + ' connected');

    socket.on('hero', function(msg) {
        socket.broadcast.emit('hero', msg);
    });
});

http.listen(3000);
