import Cell from './cell';
import config from './config';
import Tile from './tile';
import tiles from './tiles';

export default {
    layout: [],

    init() {
        for (let i = 0; i < config.boardCols; i += 1) {
            this.layout[i] = {};
            for (let j = 0; j < config.boardRows; j += 1) {
                this.layout[i][j] = new Cell(i, j);
            }
        }

        const firstTile = tiles.getFromStock(0);
        firstTile.set(config.firstTile.x, config.firstTile.y);
    },

    get(x, y) {
        if (!this.layout[x]) return false;
        return this.layout[x][y];
    },

    save(x, y, data) {
        this.layout[x][y].save(data);
    },

    setUsed(x, y) {
        this.layout[x][y].setUsed();
    },

    setStolen(x, y) {
        this.layout[x][y].setStolen();
    }
}
