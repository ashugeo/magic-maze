import config from './config';
import board from './board';
import pieces from './pieces';
import Tile from './tile';

export default class Bot {

    constructor(id, roles) {
        this.id = id;
        this.roles = roles;
    }

    init() {
        this.interval = setInterval(() => { this.solve() }, config.botsInterval);
    }

    solve() {
        for (let piece of pieces.all) {
            const cell = board.getCell(piece.cell.x, piece.cell.y);

            // console.log(piece.cell.x, piece.cell.y, cell.item);

            if (this.roles.indexOf('explore') > -1) {
                if (cell.item && cell.item.type === 'bridge' && cell.item.color === piece.color && !cell.item.opened) {
                    this.newTile(piece.cell.x, piece.cell.y);
                }
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
        const cell = board.getCell(x, y);
        const enter = tile.getEnter(x, y, cell.tileCell.x);

        if (Object.keys(board.getCell(enter.x, enter.y)).length > 0) {
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

        // Mark bridge as opened
        board.setOpened(x, y);
    }
}
