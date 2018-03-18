const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const actions = require('../app/data/actions.json');

app.use(express.static(__dirname + '/'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

let players = [];
let adminID = '';

io.sockets.on('connection', (socket) => {
    // New player entered room
    players = Object.keys(io.sockets.sockets);
    // Tell everyone
    io.emit('players', players.length);

    // First player, make him admin
    if (players.length === 1) {
        adminID = socket.id;
        socket.emit('admin');
    }

    socket.on('disconnect', () => {
        // Player left the room
        players = Object.keys(io.sockets.sockets);
        // Tell everyone
        io.emit('players', players.length);

        // It was the admin, set a new admin
        if (players.indexOf(adminID) === -1) {
            adminID = players[0];
            // Tell him
            io.to(players[0]).emit('admin');
        }
    });

    socket.on('start', () => {
        // Make sure the admin started the game
        if (socket.id === adminID) {

            // Get all actions for that number of players
            let currentActions = [];
            for (let i in actions) {
                if (actions[i].players.indexOf(players.length) > -1) {
                    currentActions.push(actions[i]);
                }
            }

            // Give actions to players randomly
            shuffle(currentActions);
            for (let i in currentActions) {
                i = parseInt(i);
                // Tell this player his role
                io.to(players[i]).emit('role', currentActions[i])
            }

            // Tell everyone to start game
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

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
}
