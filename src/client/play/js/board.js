import Cell from './cell';
import config from './config';
import Tile from './tile';
import tiles from './tiles';
import ui from './ui';

export default {
    layout: [],
    ready: false,

    init(board) {
        const size = config.size;

        for (let i = 0; i < config.boardCols; i += 1) {
            this.layout[i] = {};
            for (let j = 0; j < config.boardRows; j += 1) {
                this.layout[i][j] = new Cell(i, j);
            }
        }
        
        let boardHTML = '';
        let gridHTML = '';

        for (let i = 0; i < (config.boardCols - 1) / 4; i += 1) {
            for (let j = 0; j < (config.boardRows - 1) / 4; j += 1) {
                const x = i * 4 * size - j * .85 * size;
                const y = j * 4 * size + i * .85 * size;
                const s = size * 4;

                for (let n = 0; n < 4; n += 1) {
                    for (let m = 0; m < 4; m += 1) {
                        const _x = x + n * size + [0, 5, 0, -5][n];
                        const _y = y + m * size + [0, 5, 0, -5][m];
                        const w = size + [5, -5, -5, 5][n];
                        const h = size + [5, -5, -5, 5][m];

                        // Draw cell
                        gridHTML += `<rect x="${_x}" y="${_y}" width="${w}" height="${h}" fill="white" stroke="red" data-x=${i * 4 + n} data-y="${j * 4 + m}" />`;

                        const text = `${i * 4 + n}:${j * 4 + m}`;

                        // Add coordinates as text
                        gridHTML += `<text x="${_x + 2}" y="${_y + 10}" style="font-size: 8px; font-family: system-ui;">${text}</text>`
                    }
                }

                // Draw tile
                boardHTML += `<rect class="hitbox" x="${x}" y="${y}" width="${s}" height="${s}" fill="white" stroke="blue" data-x=${i * 4} data-y="${j * 4}" />`;
            }    
        }

        ui.setHTML('board', boardHTML);
        ui.setHTML('grid', gridHTML);
        
        this.ready = true;
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

        let _x = (x - Math.floor(y / 4) * .85 + [.5, .36, .18, 0][x % 4]) * config.size;
        let _y = (y + Math.floor(x / 4) * .85 + [.5, .36, .18, 0][y % 4]) * config.size;

        const itemHTML = `<image href="./img/used.png" height="${.5 * config.size}" width="${.5 * config.size}" transform="translate(${_x} ${_y})" />`;

        ui.addHTML('items', itemHTML);
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
