import config from './config';

export default {
    board: [],

    init() {
        for (let i = 0; i < config.boardCols; i += 1) {
            this.board[i] = {};
            for (let j = 0; j < config.boardRows; j += 1) {
                this.board[i][j] = {};
            }
        }
    },

    getCell(x, y) {
        return this.board[x][y];
    },

    save(x, y, cell) {
        this.board[x][y] = cell;
    }
}
