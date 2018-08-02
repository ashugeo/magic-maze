import config from './config';
import Tile from './tile';

export default {
    layout: [],

    init() {
        for (let i = 0; i < config.boardCols; i += 1) {
            this.layout[i] = {};
            for (let j = 0; j < config.boardRows; j += 1) {
                this.layout[i][j] = {};
            }
        }

        window.tiles.push(new Tile(0));
        window.tiles[0].set(config.firstTile.x, config.firstTile.y);
    },

    getCell(x, y) {
        if (!this.layout[x]) return false;
        return this.layout[x][y];
    },

    save(x, y, cell) {
        this.layout[x][y] = cell;
    },

    setUsed(x, y) {
        this.layout[x][y].item.used = true;
    },

    setExplored(x, y) {
        this.layout[x][y].item.explored = true;
    }
}
