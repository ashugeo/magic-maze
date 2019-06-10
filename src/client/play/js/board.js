import Cell from './cell';
import config from './config';
import Tile from './tile';
import tiles from './tiles';

export default {
    layout: [],

    init(board) {
        for (let i = 0; i < config.boardCols; i += 1) {
            this.layout[i] = {};
            for (let j = 0; j < config.boardRows; j += 1) {
                this.layout[i][j] = new Cell(i, j);
            }
        }
    },

    getAll() {
        return this.layout;
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

    findItem(item) {
        let cells = [];
        for (let i = 0; i < config.boardCols; i += 1) {
            for (let j = 0; j < config.boardRows; j += 1) {
                const cell = this.get(i, j);
                if (cell && cell.item && cell.item.type === item) cells.push(cell);
            }
        }
        return cells;
    },

    count(item) {
        return this.findItem(item).length;
    }
}
