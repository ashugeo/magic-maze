import p5 from 'p5';
import sketch from './sketch'
import board from './board';
import Tile from './tile';
import Hero from './hero';
import pieces from './pieces';

window.tiles = [];
window.json = [];
window.socket = io({transports: ['websocket'], upgrade: false});
window.role = [];

const tiles = 3;
fetchJSON(0);

function fetchJSON(i) {
    fetch('data/tile' + i + '.json').then(response => response.json()).then(data => {
        window.json.push(data);

        if (i < tiles - 1) {
            fetchJSON(i + 1);
        }
    });
}

function start() {
    new p5(sketch);
    window.tiles.push(new Tile(0));
    window.tiles[0].set(10, 10);
}

const $players = document.getElementById('players');
const $ui = document.getElementById('ui');

socket.on('players', (players) => {
    $players.innerHTML = players;
    $players.innerHTML += players > 1 ? ' joueurs connectés.' : ' joueur connecté.';
});

socket.on('admin', () => {
    // Timeout needed to give time for 'players' event
    setTimeout(() => {
        $ui.innerHTML += `<div class="admin">
        <p>Vous êtes administrateur de la partie.</p>
        <div id="start" class="button">Commencer la partie !</div>
        </div>`;

        document.getElementById('start').addEventListener('mousedown', () => {
            socket.emit('start');
            document.getElementsByClassName('admin')[0].innerHTML = '';
        });
    }, 500);
});

socket.on('start', () => {
    start();
});

socket.on('role', (roles) => {
    // Save my role
    role = roles;

    // Display role
    $ui.innerHTML += 'Actions autorisées : ';
    for (let i in roles) {
        i = parseInt(i);
        $ui.innerHTML += roles[i];
        if (roles[i+1]) $ui.innerHTML += ', ';
    }
    $ui.innerHTML += '.'
});

socket.on('hero', (data) => {
    const hero = pieces.pieces[data.id];
    const cell = data.cell;
    hero.set(cell);
});

socket.on('board', (data) => {
    board.save(data.x, data.y, data.cell)
});

socket.on('tile', (data) => {
    const tile = new Tile(data.tile.id);
    tile.rotate = data.tile.rotate;
    window.tiles.push(tile);
    tile.set(data.x, data.y);
});
