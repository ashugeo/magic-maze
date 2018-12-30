import ai from './ai';
import app from './app';
import board from './board';
import clock from './clock';
import game from './game';
import heroes from './heroes';
import player from './player';
import ui from './ui';
import user from './user';
import tiles from './tiles';

export default {
    init() {
        socket.on('people', people => {
            let html = people.all - people.bots;
            html += people.all - people.bots > 1 ? ' players online' : ' player online';
            if (people.bots) html += people.bots > 1 ? ` (and ${people.bots} bots)` : ' (and 1 bot)';
            ui.setHTML('people', html);
        });

        socket.on('admin', () => {
            let html = `<h3>Game admin</h3>
            <p>Bot(s) <input type="number" id="bots" value="1" min="0" max="7" /></p>
            <p>Scenario <input type="number" id="scenario" value="5" min="1" max="15" /></p>
            <button id="start">Start game!</button>`;

            ui.setHTML('admin', html);
            ui.addEvent('start', 'click', () => { socket.emit('prestart'); });
        });

        socket.on('prestart', isAdmin => {
            const spectator = ui.getProperty('spectator', 'checked');

            if (isAdmin) {
                // Ask admin for game parameters
                const bots = ui.getProperty('bots', 'value');
                const scenario = ui.getProperty('scenario', 'value');
                socket.emit('settings', { bots, scenario, spectator });
            } else {
                socket.emit('settings', { spectator });
            }
        });

        socket.on('start', options => {
            user.start(options);

            ui.remove('spectator-ui');

            if (options.admin) {
                // Admin only
                ui.remove('admin');
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
