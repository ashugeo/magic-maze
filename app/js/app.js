import p5 from 'p5';
import sketch from './sketch';
import config from './config';
import board from './board';
import Tile from './tile';
import Hero from './hero';
import pieces from './pieces';
import events from './events';
import clock from './clock';
import game from './game';
import ai from './ai';

window.tiles = [];
window.json = [];
window.socket = io({transports: ['websocket'], upgrade: false});
window.role = [];

fetchJSON(0);

function fetchJSON(i) {
    fetch('data/tile' + i + '.json').then(response => response.json()).then(data => {
        window.json.push(data);

        if (i < config.tiles - 1) {
            fetchJSON(i + 1);
        }
    });
}

function start(options) {
    new p5(sketch);
    game.init(options);
    board.init();
    events.init();
    pieces.init();
    clock.init();
    if (game.admin) ai.run();
}

const $ui = document.getElementById('ui');
const $players = document.getElementById('players');

socket.on('players', players => {
    $players.innerHTML = players;
    $players.innerHTML += players > 1 ? ' joueurs connectés.' : ' joueur connecté.';
});

socket.on('admin', () => {
    // Timeout needed to give time for 'players' event
    setTimeout(() => {
        $ui.innerHTML += `<div id="admin">
        <p>Vous êtes administrateur de la partie.</p>
        <input type="number" id="bots" value="1" /> bot(s)
        <button id="start">Commencer la partie !</button>
        </div>`;

        document.getElementById('start').addEventListener('mousedown', () => {
            socket.emit('start', {
                bots: parseInt(document.getElementById('bots').value)
            });
            document.getElementById('admin').innerHTML = '';
        });
    }, 100);
});

socket.on('start', options => {
    start(options);
});

socket.on('role', roles => {
    // Save my role
    role = roles;

    // Display role
    $ui.innerHTML += 'Actions autorisées : ';
    for (let i in roles) {
        i = parseInt(i);
        $ui.innerHTML += roles[i];
        if (roles[i + 1]) $ui.innerHTML += ', ';
    }
    $ui.innerHTML += '.'
});

socket.on('hero', data => {
    const hero = pieces.all[data.id];
    const cell = data.cell;
    hero.set(cell);
});

socket.on('board', data => {
    board.save(data.x, data.y, data.cell)
});

socket.on('tile', data => {
    const tile = new Tile(data.tile.id);
    tile.rotation = data.tile.rotation;
    window.tiles.push(tile);
    tile.set(data.x, data.y);
});

socket.on('invertClock', data => {
    clock.invert();
});

socket.on('used', data => {
    board.setUsed(data.x, data.y);
});
