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

io.sockets.on('connection', socket => {
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

    socket.on('start', options => {
        // Make sure the admin started the game
        if (socket.id === adminID) {
            let allPlayers = players.length

            // Add bots to players
            if (options.bots > 0) {
                allPlayers += options.bots;
                options.botsRoles = [];
            }

            // Get all actions for that number of players
            let roles = [];
            for (let i in actions) {
                if (actions[i].players.indexOf(allPlayers) > -1) {
                    roles.push(actions[i].roles);
                }
            }

            if (allPlayers === 1) {
                // Only one player, merge roles together
                let allRoles = [].concat(...roles);
                io.to(players[0]).emit('role', allRoles);
            } else {
                // Give actions to players randomly
                shuffleArray(roles);
                for (let i in roles) {
                    i = parseInt(i);

                    if (players[i]) {
                        // Tell this player his role(s)
                        io.to(players[i]).emit('role', roles[i]);
                    } else if (options.bots > 0) {
                        // Not a player but a bot, save in options
                        options.botsRoles.push(roles[i]);
                    }
                }
            }

            // Tell everyone to start game
            io.emit('start', options);
        }
    });

    socket.on('hero', data => {
        socket.broadcast.emit('hero', data);
    });

    socket.on('board', data => {
        socket.broadcast.emit('board', data);
    });

    socket.on('tile', data => {
        socket.broadcast.emit('tile', data);
    });

    socket.on('invertClock', data => {
        socket.broadcast.emit('invertClock');
    });

    socket.on('used', data => {
        socket.broadcast.emit('used', data);
    });
});

http.listen(3000);

function shuffleArray(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
}
