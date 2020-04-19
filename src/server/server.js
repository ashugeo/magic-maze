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
});

const listener = http.listen(process.env.PORT || 3000, () => {
    console.log(`✨ App running on port ${listener.address().port}`);
    console.log(`🔗 http://localhost:${listener.address().port}/\n`);
});

io.sockets.on('connection', socket => {
    // List all opened rooms on homepage
    for (const roomID of Object.keys(io.sockets.adapter.rooms)) {
        const room = io.sockets.adapter.rooms[roomID];
        if (room.id) io.emit('home', room);
    }

    // New player entered a room
    socket.on('join', params => {
        const roomID = params.room;
        socket.join(roomID);
        socket.roomID = roomID;
        socket.name = params.name;

        const room = io.sockets.adapter.rooms[roomID];

        room.id = roomID;

        room.members = Object.keys(room.sockets).map(socketID => ({ id: socketID, name: io.sockets.sockets[socketID].name }));

        // Game already started
        if (room.isStarted) {
            // Join as spectator
            room.members.find(m => m.id === socket.id).isSpectator = true;
            socket.scenario = room.options.scenario;
            io.to(room.adminID).emit('getStatus', socket.id);
        }

        // Tell everyone
        io.to(roomID).emit('members', room.members );
        io.emit('home', room);

        // First player, make it admin
        if (room.members.length === 1) {
            room.adminID = socket.id;
            socket.emit('admin');
        }
    });

    socket.on('status', (data, user) => {
        io.to(user).emit('start', {
            board: data.board,
            clock: data.clock,
            heroes: data.heroes,
            tiles: data.tiles,
            scenario: io.sockets.sockets[user].scenario
        });
    });

    // User disconnected from a room
    socket.on('disconnect', () => {
        const roomID = socket.roomID;
        const room = io.sockets.adapter.rooms[roomID];

        // No more players, room gets deleted
        if (roomID && !room) io.emit('home', { id: roomID });
        if (!room) return;

        // Tell everyone
        room.members = Object.keys(room.sockets).map(socketID => ({ id: socketID, name: io.sockets.sockets[socketID].name }));

        // TODO: update bots count
        io.to(roomID).emit('members', room.members);
        io.emit('home', room);

        // It was the admin, set a new admin
        if (socket.id === room.adminID) {
            const users = Object.keys(room.sockets);
            const adminID = users[0];
            room.adminID = adminID;

            // Tell him
            io.to(adminID).emit('admin');
        }

        // TODO: remove from spectators
    });

    // Admin has clicked start, get each player's settings
    socket.on('prestart', () => {
        const roomID = socket.roomID;
        const room = io.sockets.adapter.rooms[roomID];
        const users = Object.keys(room.sockets);
        const adminID = room.adminID;

        for (let user of users) {
            if (user === adminID) {
                // Ask admin if he's a spectator + game parameters
                io.to(user).emit('prestart', true);
            } else {
                // Ask player if he's a spectator
                io.to(user).emit('prestart');
            }
        }
    });

    // Getting player settings (wait for everyone then start with options)
    socket.on('settings', settings => {
        const roomID = socket.roomID;
        const room = io.sockets.adapter.rooms[roomID];
        const adminID = room.adminID;

        room.members.find(m => m.id === socket.id).isSpectator = settings.isSpectator;

        // If admin, build options object with additional data
        if (socket.id === adminID) room.options = { bots: settings.bots, scenario: settings.scenario };

        // When the spectator status of everyone is known, the game can start
        if (room.members.every(m => m.isSpectator !== undefined)) start(room);
    });

    socket.on('hero', data => {
        socket.to(socket.roomID).emit('hero', data);
    });

    socket.on('board', data => {
        socket.to(socket.roomID).emit('board', data);
    });

    socket.on('tile', data => {
        socket.to(socket.roomID).emit('tile', data);
    });

    socket.on('used', data => {
        socket.to(socket.roomID).emit('used', data);
    });

    socket.on('invertClock', () => {
        socket.to(socket.roomID).emit('invertClock');
    });

    socket.on('ai', () => {
        const adminID = io.sockets.adapter.rooms[socket.roomID].adminID;
        io.to(adminID).emit('ai');
    });

    // socket.on('swap', () => {
    //     // Get role of last player
    //     let lastPlayersRoles = players[players.length - 1].roles;
    //
    //     // Set role of previous player for
    //     for (let i = players.length - 1; i >= 0; i -= 1) {
    //         if (i > 0) {
    //             players[i].roles = players[i - 1].roles;
    //         } else {
    //             players[i].roles = lastPlayersRoles;
    //         }
    //     }
    //
    //     // Tell everyone his new roles
    //     for (let player of players) {
    //         // Can't emit to bots
    //         if (player.bot) continue;
    //
    //         // Tell this player his new roles
    //         if (player.id === adminID) {
    //             io.to(player.id).emit('roles', {
    //                 self: player.roles,
    //                 bots: people.filter(p => { return p.bot })
    //             });
    //         } else {
    //             io.to(player.id).emit('roles', { self: player.roles });
    //         }
    //     }
    // });
});

function start(room) {
    room.isStarted = true;

    // Add bots to players
    if (room.options.bots) {
        for (let i = 0; i < room.options.bots; i += 1) {
            room.members.push({
                id: 'bot' + i,
                name: 'bot' + i,
                isBot: true
            });
        }
    }

    // Build array of players (exclude spectators)
    const players = room.members.filter(m => !m.isSpectator);

    // A game can't start with no one playing
    if (Object.keys(players).length === 0) return;

    // Update players count with bots
    io.to(room.id).emit('members', room.members);

    // Get all actions for that number of players
    let roles = [];
    for (const i in actions) {
        if (actions[i].players.includes(Object.keys(players).length)) roles.push(actions[i].roles);
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

    // Launch game
    const bots = players.filter(p => p.isBot);

    for (const member of room.members) {
        if (member.id === room.adminID) {
            io.to(member.id).emit('start', {
                roles: member.roles || null,
                scenario: room.options.scenario,
                players,
                bots,
                admin: true
            });
        } else {
            io.to(member.id).emit('start', {
                roles: member.roles || null,
                scenario: room.options.scenario,
                players
            });
        }
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        const x = array[i];
        array[i] = array[j];
        array[j] = x;
    }
    return array;
}
