import config from './config';
import Tile from './tile';

export default {
    board: [],

    init() {
        for (let i = 0; i < config.boardCols; i += 1) {
            this.board[i] = {};
            for (let j = 0; j < config.boardRows; j += 1) {
                this.board[i][j] = {};
            }
        }

        window.tiles.push(new Tile(0));
        window.tiles[0].set(config.firstTile.x, config.firstTile.y);
    },

    getCell(x, y) {
        if (!this.board[x]) return false;
        return this.board[x][y];
    },

    save(x, y, cell) {
        this.board[x][y] = cell;
    },

    setUsed(x, y) {
        this.board[x][y].item.used = true;
    },

    setOpened(x, y) {
        this.board[x][y].item.opened = true;
    }
}
