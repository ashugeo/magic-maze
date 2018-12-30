import ai from './ai';
import board from './board';
import config from './config';
import events from './events';
import heroes from './heroes';
import Tile from './tile';
import tiles from './tiles';

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
        if (action.role === 'explore' && tiles.getStockSize()) {
            this.newTile(action.cell.x, action.cell.y, action.crystal);
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
    * @param  {int}    x       gate X coordinate
    * @param  {int}    y       gate Y coordinate
    * @param  {Object} crystal crystal cell (optional)
    */
    newTile(x, y, crystal) {
        // Pick next tile
        const tile = tiles.getFromStock();

        // Get cell and enter coordinates
        const cell = board.get(x, y);
        const enter = tile.getEnter(x, y, cell.tileCell.x);

        if (!board.get(enter.x, enter.y).isEmpty()) {
            // Already a tile there, cancel
            tiles.putBackInStock();
            return;
        }

        // Compute new orientation relative to gate X coordinate
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

        // Mark gate as explored
        cell.setExplored(x, y);

        // This tile was picked thanks to a crystal
        if (crystal) crystal.addOneUse();

        // Run AI again
        ai.run();
    }
}
