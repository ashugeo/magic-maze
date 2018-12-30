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

        const firstTile = tiles.getFromStock();
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

    count(item) {
        let count = 0;
        for (let i = 0; i < config.boardCols; i += 1) {
            for (let j = 0; j < config.boardRows; j += 1) {
                if (this.layout[i][j] && this.layout[i][j].item && this.layout[i][j].item.type === item) count += 1;
            }
        }
        return count;
    }
}
