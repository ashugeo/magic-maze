import ai from './ai';
import board from './board';
import config from './config';
import events from './events';
import game from './game';
import heroes from './heroes';
import Tile from './tile';

export default class Bot {
    constructor(id, roles) {
        this.id = id;
        this.roles = roles;
    }

    /**
    * Execute an action
    * @param  {Object} action Action to execute
    */
    play(action) {
        if (action.role === 'explore' && game.getStockSize()) {
            this.newTile(action.cell.x, action.cell.y);
        } else if (action.type === 'move') {
            // Make sure hero is selectable
            if (action.hero.selectable) {
                action.hero.set(action.target.x, action.target.y);
                socket.emit('hero', {
                    id: action.hero.id,
                    cell: action.target
                });
                events.checkForEvents(action.target, action.hero);
            }
        }
    }

    /**
    * Create and set a new tile
    * @param  {int} x bridge X coordinate
    * @param  {int} y bridge Y coordinate
    */
    newTile(x, y) {
        // Pick next tile
        const tile = game.getFromStock();

        // Get cell and enter coordinates
        const cell = board.get(x, y);
        const enter = tile.getEnter(x, y, cell.tileCell.x);

        if (!board.get(enter.x, enter.y).isEmpty()) {
            // Already a tile there, cancel
            console.log('cancel');
            game.putBackInStock();
            return;
        }

        // Compute new orientation relative to bridge X coordinate
        let o = tile.getOrientation();
        let _o = [1, 0, 2, 3][cell.tileCell.x];

        // Rotate tile by difference
        tile.rotate(_o - o);

        // Set tile at origin
        const origin = tile.getOrigin(enter.x, enter.y, _o);

        tile.set(origin.x, origin.y);
        socket.emit('tile', {
            x: origin.x,
            y: origin.y,
            tile: tile
        });

        // Mark bridge as explored
        cell.setExplored(x, y);

        // Run AI again
        ai.run();
    }
}
