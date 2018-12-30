import ai from './ai';
import app from './app';
import board from './board';
import clock from './clock';
import game from './game';
import heroes from './heroes';
import player from './player';
import user from './user';
import tiles from './tiles';

export default {
    init() {
        const $ui = document.getElementById('ui');
        const $admin = document.getElementById('admin');
        const $people = document.getElementById('people');
        const $spectator = document.getElementById('spectator');

        socket.on('people', people => {
            $people.innerHTML = people.all - people.bots;
            $people.innerHTML += people.all - people.bots > 1 ? ' players online' : ' player online';
            if (people.bots) $people.innerHTML += people.bots > 1 ? ` (and ${people.bots} bots)` : ' (and 1 bot)';
        });

        socket.on('admin', () => {
            $admin.innerHTML = `<h3>Game admin</h3>
            <p>Bot(s) <input type="number" id="bots" value="0" min="0" max="7" /></p>
            <p>Scenario <input type="number" id="scenario" value="3" min="1" max="15" /></p>
            <button id="start">Start game!</button>`;

            document.getElementById('start').addEventListener('click', () => {
                socket.emit('prestart');
            });
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
            user.start(options);

            document.getElementById('spectator-ui').remove();

            if (options.admin) {
                // Admin only
                document.getElementById('admin').remove();
            }
        });

        socket.on('roles', roles => {
            player.setRoles(roles.self);
            if (game.isAdmin() && ai.bots.length > 0) ai.setRoles(roles.bots);
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
    }
}
