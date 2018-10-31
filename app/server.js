const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const actions = require('./data/actions.json');

app.use(express.static(__dirname + '/'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

let people = [];
let adminID = '';
let options = {};

io.sockets.on('connection', socket => {
    // New person entered the room
    people.push({id: socket.id, spectator: undefined});

    // Tell everyone
    io.emit('people', people.length);

    // First person, make it admin
    if (people.length === 1) {
        adminID = socket.id;
        socket.emit('admin');
    }

    socket.on('disconnect', () => {
        // This person left the room, remove it from people array
        people = people.filter(p => { return (p.id !== socket.id); });
        // Tell everyone
        io.emit('people', people.length);

        // It was the admin, set a new admin
        if (people.length > 0 && !people.some(p => {return p.id === adminID})) {
            adminID = people[0].id;
            // Tell him
            io.to(adminID).emit('admin');
        }
    });

    socket.on('prestart', () => {
        for (let person of people) {
            if (person.id === adminID) {
                io.to(person.id).emit('prestart', true);
            } else {
                io.to(person.id).emit('prestart');
            }
        }
    });

    socket.on('settings', settings => {
        const person = people.find(p => { return p.id === socket.id; });
        person.spectator = settings.spectator;

        // If admin, build options object with additional data
        if (socket.id === adminID) {
            options = { bots: settings.bots, scenario: settings.scenario };
        }

        // When the spectator status of everyone is known, the game can start
        for (let person of people) {
            if (person.spectator === undefined) return false;
        }
        start(socket.id, options);
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

    socket.on('invertClock', () => {
        socket.broadcast.emit('invertClock');
    });

    socket.on('used', data => {
        socket.broadcast.emit('used', data);
    });

    // TODO: admin could see ai-running events instead
    socket.on('ai', () => {
        io.to(adminID).emit('ai');
    });
});

http.listen(3000);

function shuffleArray(a) {
    for (let i = a.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
}

function start(id, options) {
    // Make sure the admin started the game
    if (id !== adminID) return;

    // Build players array
    const players = people.filter(p => { return !p.spectator });
    let playersCount = players.length;

    // This game has bots
    if (options.bots > 0) {
        // Add bots to players count
        playersCount += options.bots;

        options.botsRoles = [];
    }

    // A game can't start with no one playing
    if (playersCount === 0) return;

    // Get all actions for that number of players
    let roles = [];
    for (let i in actions) {
        if (actions[i].players.indexOf(playersCount) > -1) {
            roles.push(actions[i].roles);
        }
    }

    if (playersCount === 1) {
        // Only one player, merge roles together
        let allRoles = [].concat(...roles);

        if (players.length === 1) {
            // Admin is the only player
            io.to(players[0].id).emit('role', allRoles);
        } else {
            // Admin is watching one bot play
            options.botsRoles.push(allRoles);
        }
    } else {
        // Give actions to players randomly
        shuffleArray(roles);

        for (let i in roles) {
            i = parseInt(i);

            if (players[i]) {
                // Tell this player his role(s)
                io.to(players[i].id).emit('role', roles[i]);
            } else {
                // Not a player but a bot, save in options
                options.botsRoles.push(roles[i]);
            }
        }
    }

    // Tell everyone to start game
    for (let person of people) {
        if (person.id === adminID) {
            options.admin = true;
            io.to(person.id).emit('start', options);
        } else {
            io.to(person.id).emit('start', {
                'scenario': options.scenario
            });
        }
    }
}
