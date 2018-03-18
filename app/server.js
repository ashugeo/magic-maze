const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname + '/'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

let players = 0;
let adminID = '';

io.on('connection', (socket) => {
    players++;
    io.emit('players', players);
    console.log(players);

    if (players === 1) {
        socket.emit('admin');
        adminID = socket.id;
        console.log('Admin has id', adminID);
    }

    socket.on('disconnect', (socket) => {
        players--;
        io.emit('players', players);
        console.log(players);
    });

    socket.on('start', () => {
        if (socket.id === adminID) {
            io.emit('start');
        }
    });

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
