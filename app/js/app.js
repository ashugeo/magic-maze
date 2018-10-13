import ai from './ai';
import board from './board';
import clock from './clock';
import config from './config';
import events from './events';
import game from './game';
import Hero from './hero';
import heroes from './heroes';
import p5 from 'p5';
import sketch from './sketch';
import Tile from './tile';

let deck = [];
window.socket = io({transports: ['websocket'], upgrade: false});
window.role = [];

fetchJSON(0);

function fetchJSON(i) {
    fetch('data/tile' + i + '.json').then(response => response.json()).then(data => {
        deck.push({id: i, data: data});

        if (i < config.tiles - 1) {
            fetchJSON(i + 1);
        }
    });
}

function start(options) {
    new p5(sketch);
    game.init(deck, options);
    board.init();
    events.init();
    heroes.init();
    clock.init();
    if (game.isAdmin()) ai.run();
}

const $ui = document.getElementById('ui');
const $admin = document.getElementById('admin');
const $people = document.getElementById('people');
const $spectator = document.getElementById('spectator');

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('spectator').addEventListener('mouseup', (e) => {
        const spectator = !e.srcElement.checked;
        socket.emit('spectator', spectator);
    });
});

// FIXME: why is this not reliable?
socket.on('people', people => {
    $people.innerHTML = people;
    $people.innerHTML += people > 1 ? ' joueurs connectés' : ' joueur connecté';
});

socket.on('admin', () => {
    // Timeout needed to give time for 'players' event
    setTimeout(() => {
        $admin.innerHTML += `<h3>Maître du jeu</h3>
        <p>Bot(s) <input type="number" id="bots" value="0" min="0" max="7" /></p>
        <p>Scénario <input type="number" id="scenario" value="1" min="1" max="15" /></p>
        <button id="start">Commencer la partie !</button>`;

        document.getElementById('start').addEventListener('mousedown', () => {
            socket.emit('start', {
                bots: parseInt(document.getElementById('bots').value),
                scenario: parseInt(document.getElementById('scenario').value)
            });
        });

    }, 100);
});

socket.on('start', options => {
    start(options);

    if (options) {
        // Admin only
        document.getElementById('admin').remove();
    }
});

socket.on('role', roles => {
    // Save my role
    role = roles;

    // Display role
    let text = '<p>Actions autorisées : ';
    for (let i in roles) {
        i = parseInt(i);
        text += roles[i];
        if (roles[i + 1]) text += ', ';
    }
    text += '.</p>'

    $ui.innerHTML += text;
});

socket.on('hero', data => {
    const hero = heroes.all[data.id];
    const cell = data.cell;
    hero.set(cell.x, cell.y);
});

socket.on('board', data => {
    board.save(data.x, data.y, data.cell)
});

socket.on('tile', data => {
    const tile = game.getTile(data.tile.id);
    tile.rotation = data.tile.rotation;
    tile.set(data.x, data.y);
    game.board.push(tile.id);
});

socket.on('invertClock', data => {
    clock.invert();
});

socket.on('used', data => {
    board.setUsed(data.x, data.y);
});

socket.on('ai', data => {
    ai.run();
});
