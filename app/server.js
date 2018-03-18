const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname + '/'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('user ' + socket.id + ' connected');

    socket.on('hero', (data) => {
        socket.broadcast.emit('hero', data);
    });

    socket.on('board', (data) => {
        socket.broadcast.emit('board', data);
    });

    socket.on('tile', (data) => {
        socket.broadcast.emit('tile', data);
    });
});

http.listen(3000);
