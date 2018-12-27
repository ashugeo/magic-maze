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
import tiles from './tiles';

const $ui = document.getElementById('ui');
const $admin = document.getElementById('admin');
const $people = document.getElementById('people');
const $spectator = document.getElementById('spectator');
const $roles = document.getElementById('roles');

let $currentAction;

let allTiles = [];
let scenarios = [];
window.socket = io({transports: ['websocket'], upgrade: false});
window.role = [];
window.allActions = [];

fetch('data/tiles.json').then(response => response.json()).then(data => {
    allTiles = data;
});

fetch('data/scenarios.json').then(response => response.json()).then(data => {
    scenarios = data;
});

function start(options) {
    new p5(sketch);
    game.init(options);
    if (options.roles) setRoles(options.roles);
    const deck = buildDeck(options.scenario);
    tiles.init(deck);
    board.init();
    events.init();
    heroes.init();
    clock.init();
    if (game.isAdmin()) ai.run();
}

function buildDeck(scenario) {
    let deck = {};
    const ids = scenarios[scenario].tiles;

    for (let id of ids) {
        deck[id] = allTiles[id];
    }

    return deck;
}

// FIXME: why is this not reliable?
socket.on('people', people => {
    $people.innerHTML = people.all - people.bots;
    $people.innerHTML += people.all - people.bots > 1 ? ' players online' : ' player online';
    if (people.bots) $people.innerHTML += people.bots > 1 ? ` (and ${people.bots} bots)` : ' (and 1 bot)';
});

socket.on('admin', () => {
    // Timeout needed to give time for 'players' event
    setTimeout(() => {
        $admin.innerHTML += `<h3>Game admin</h3>
        <p>Bot(s) <input type="number" id="bots" value="0" min="0" max="7" /></p>
        <p>Scenario <input type="number" id="scenario" value="3" min="1" max="15" /></p>
        <button id="start">Start game!</button>`;

        document.getElementById('start').addEventListener('click', () => {
            socket.emit('prestart');
        });

    }, 100);
});

socket.on('prestart', isAdmin => {
    const spectator = $spectator.checked;

    if (isAdmin) {
        // Ask admin for game parameters
        const bots = parseInt(document.getElementById('bots').value);
        const scenario = parseInt(document.getElementById('scenario').value);
        socket.emit('settings', { bots, scenario, spectator });
    } else {
        socket.emit('settings', { spectator });
    }
});

socket.on('start', options => {
    start(options);

    document.getElementById('spectator-ui').remove();

    if (options.admin) {
        // Admin only
        document.getElementById('admin').remove();
    }
});

socket.on('roles', roles => {
    setRoles(roles.self);
    if (game.isAdmin() && ai.bots.length > 0) ai.setRoles(roles.bots);
});

function setRoles(roles) {
    // Save my role in window.role
    role = roles;

    if (game.players === 1) {
        allActions = roles;
        // First role in shuffled array
        role = role[0];

        let text = `<p>Current action: <span id="currentAction">${role}</span></p>
        <button id="nextAction">Next action</button>`;
        $roles.innerHTML = text;

        document.getElementById('nextAction').addEventListener('click', (e) => {
            if (e.path[0].classList.contains('disabled')) return;
            nextAction();
        });

        $currentAction = document.getElementById('currentAction');
    } else {
        // Display role
        let text = '<p>Authorized actions: ';
        for (let i in roles) {
            i = parseInt(i);
            text += roles[i];
            if (roles[i + 1]) text += ', ';
        }
        text += '.</p>'

        $roles.innerHTML = text;
    }
}

function nextAction() {
    let i = allActions.indexOf(role);
    i = i + 1 === allActions.length ? 0 : i + 1;
    role = allActions[i];

    $currentAction.innerHTML = role;
}

socket.on('hero', data => {
    const hero = heroes.all[data.id];
    const cell = data.cell;
    hero.set(cell.x, cell.y);
});

socket.on('board', data => {
    board.save(data.x, data.y, data.cell)
});

socket.on('tile', data => {
    const tile = tiles.getTile(data.tile.id);
    tile.rotation = data.tile.rotation;
    tile.set(data.x, data.y);
    tiles.board.push(tile.id);
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
