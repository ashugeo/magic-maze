const express = require('express');
const app = express();
const path = require('path');
const http = require('http').Server(app);
const io = require('socket.io')(http);

// TODO: move this
const actions = require('../client/play/data/actions.json');

app.use(express.static(path.resolve('public')));

app.get('/', (req, res) => {
    res.sendFile(path.resolve('public/home/index.html'));
    res.sendFile(path.resolve('public/home/main.css'));
    res.sendFile(path.resolve('public/home/bundle.js'));
});

const listener = http.listen(process.env.PORT || 3000, () => {
    console.log(`✨ App running on port ${listener.address().port}`);
    console.log(`🔗 http://localhost:${listener.address().port}/ (Open with ⌘ + double click on Mac terminal)\n`);
});

let people = [];
let players = [];
let adminID = '';
let options = {};

io.sockets.on('connection', socket => {
    // New person entered the room
    people.push({id: socket.id, spectator: undefined});

    // Tell everyone
    io.emit('people', {
        all: people.length,
        bots: people.filter(p => { return p.bot }).length
    });

    // First person, make it admin
    if (people.length === 1) {
        people[0].admin = true;
        adminID = socket.id;
        socket.emit('admin');
    }

    // User disconnected
    socket.on('disconnect', () => {
        // This person left the room, remove it from people array
        people = people.filter(p => { return (p.id !== socket.id); });
        // Tell everyone
        io.emit('people', {
            all: people.length,
            bots: people.filter(p => { return p.bot }).length
        });

        // It was the admin, set a new admin
        if (people.length > 0 && !people.some(p => { return p.id === adminID })) {
            people[0].admin = true;
            adminID = people[0].id;
            // Tell him
            io.to(adminID).emit('admin');
        }

        if (people.every(p => p.bot)) people = [];
    });

    // Admin has clicked start, get each player's settings
    socket.on('prestart', () => {
        for (let person of people) {
            if (person.id === adminID) {
                // Ask admin if he's a spectator + game parameters
                io.to(person.id).emit('prestart', true);
            } else {
                // Ask player if he's a spectator
                io.to(person.id).emit('prestart');
            }
        }
    });

    // Getting player settings (wait for everyone then start with options)
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
        start(options);
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

    socket.on('swap', () => {
        // Get role of last player
        let lastPlayersRoles = players[players.length - 1].roles;

        // Set role of previous player for
        for (let i = players.length - 1; i >= 0; i -= 1) {
            if (i > 0) {
                players[i].roles = players[i - 1].roles;
            } else {
                players[i].roles = lastPlayersRoles;
            }
        }

        // Tell everyone his new roles
        for (let player of players) {
            // Can't emit to bots
            if (player.bot) continue;

            // Tell this player his new roles
            if (player.id === adminID) {
                io.to(player.id).emit('roles', {
                    self: player.roles,
                    bots: people.filter(p => { return p.bot })
                });
            } else {
                io.to(player.id).emit('roles', { self: player.roles });
            }
        }
    });

    socket.on('used', data => {
        socket.broadcast.emit('used', data);
    });

    socket.on('ai', () => {
        io.to(adminID).emit('ai');
    });
});

function shuffleArray(a) {
    for (let i = a.length - 1; i > 0; i -= 1) {
        let j = Math.floor(Math.random() * (i + 1));
        let x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function start(options) {
    // Add bots to players
    for (let i = 0; i < options.bots; i += 1) {
        people.push({id: 'bot' + i, bot: true});
    }

    // Build array of players (exclude spectators)
    players = people.filter(p => { return !p.spectator });

    // A game can't start with no one playing
    if (players.length === 0) return;

    // Update players count with bots
    io.emit('people', {
        all: people.length,
        bots: people.filter(p => { return p.bot }).length
    });

    // Give each player a role
    giveRoles();

    // Tell everyone to start game
    emitStart();
}

function giveRoles() {
    // Get all actions for that number of players
    let roles = [];
    for (let i in actions) {
        if (actions[i].players.indexOf(players.length) > -1) {
            roles.push(actions[i].roles);
        }
    }

    // Set roles to players
    if (players.length === 1) {
        // Admin alone or admin spectating a single bot, merge roles together
        const allRoles = [].concat(...roles);
        players[0].roles = shuffleArray(allRoles);
    } else {
        // Give actions to players randomly
        roles = shuffleArray(roles);

        for (let i in roles) {
            i = parseInt(i);
            players[i].roles = roles[i];
        }
    }
}

function emitStart() {
    for (let person of people) {
        // Can't emit to bots
        if (person.bot) return;

        if (person.id === adminID) {
            io.to(person.id).emit('start', {
                roles: person.roles,
                scenario: options.scenario,
                players: players.length,
                admin: true,
                bots: people.filter(p => { return p.bot })
            });
        } else {
            io.to(person.id).emit('start', {
                roles: person.roles,
                scenario: options.scenario,
                players: players.length
            });
        }
    }
}
