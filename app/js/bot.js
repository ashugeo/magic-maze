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
        this.solve();
        // this.interval = setInterval(() => { this.solve() }, config.botsInterval);
    }

    solve() {
        // Find targets
        let targets = [];
        for (let j = 0; j < config.boardCols; j += 1) {
            for (let i = 0; i < config.boardRows; i += 1) {
                const cell = board.get(i, j);
                const item = cell.item;

                // Ignore empty cells
                if (cell.isEmpty()) continue;

                // Find unexplored bridges
                if (item.type === 'bridge' && !cell.isExplored()) {
                    targets.push(cell);
                }

                // Find articles to steal
                if (item.type === 'article' && !cell.isStolen()) {
                    targets.push(cell);
                }

                // Find exits
            }
        }
        // console.log(targets);

        for (let target of targets) {
            let piece;
            if (target.item && (target.item.type === 'bridge' || target.item === 'article')) {
                piece = pieces.getPieceByColor(target.item.color);
                let path = piece.getPath(target.coord);
                let check = piece.checkPath(target.coord, this.roles);
                let legal = piece.canGo(target.coord);
                if (path && legal) {
                    piece.set(target.coord);
                }
            }
        }

        // Check for explore
        for (let piece of pieces.all) {
            const cell = board.get(piece.cell.x, piece.cell.y);
            const item = cell.item;

            // console.log(piece.cell.x, piece.cell.y, cell.item);

            if (this.roles.indexOf('explore') > -1) {
                if (cell.item && item.type === 'bridge' && item.color === piece.color && !cell.isExplored()) {
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
    }
}
