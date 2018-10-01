import config from './config';
import board from './board';
import pieces from './pieces';
import Tile from './tile';
import game from './game';
import events from './events';
import ai from './ai';

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
        if (action.role === 'explore') {
            this.newTile(action.cell.x, action.cell.y);
        } else if (action.type === 'move') {
            // Make sure piece is selectable
            if (action.piece.selectable) {
                action.piece.set(action.target);
                socket.emit('hero', {
                    id: action.piece.id,
                    cell: action.target
                });
                events.checkForEvents(action.target, action.piece);
            }
        }
    }

    /**
    * Create and set a new tile
    * @param  {int} x bridge X coordinate
    * @param  {int} y bridge Y coordinate
    */
    newTile(x, y) {
        // Create and save new tile
        const tile = new Tile((tiles.length - 1) % (config.tiles - 1) + 1);
        tiles.push(tile);

        // Get cell and enter coordinates
        const cell = board.get(x, y);
        const enter = tile.getEnter(x, y, cell.tileCell.x);

        if (!board.get(enter.x, enter.y).isEmpty()) {
            // Already a tile there, cancel
            tiles.pop();
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
