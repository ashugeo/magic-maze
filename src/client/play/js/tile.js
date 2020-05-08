import board from './board';
import config from './config';
import heroes from './heroes';
import symbols from './symbols';
import tiles from './tiles';
import ui from './ui';

const size = config.size;

export default class Tile {
    constructor(tile) {
        this.id = tile.id;
        this.data = tile.data;
        this.rotation = 0;
        this.status = 'stock'; // stock, picked, set
        this.canBeSet = false;
        this.shift = {
            x: 0,
            y: 0
        }
    }

    move(x, y) {
        // Position hasn't changed
        if (x === this.x && y === this.y) return;

        // Prevent board overflow
        if (x < 0 || y < 0 || x > config.boardRows - 4 || y > config.boardCols - 4) {
            return;
        }

        const o = this.getOrientation();
        const enter = this.getGatePlusOne(x, y, o);
        const target = board.get(enter.x, enter.y);

        // Compute shift
        if (target) {
            const parentTile = tiles.getTile(target.tileID);

            if (parentTile) {
                let _x = 0;
                let _y = 0;

                const s = 4.6; // Shift in pixels

                // Shift depends on position and orientation
                if (target.tileCell.x === 0 && o === 1) {
                    _y += [2*s, s, 0, -s][target.tileCell.y];
                } else if (target.tileCell.x === 3 && o === 3) {
                    _y += [s, 0, -s, 2*s][target.tileCell.y];
                }

                if (target.tileCell.y === 3 && o === 0) {
                    _x += [2*s, s, 0, 0][target.tileCell.x];
                } else if (target.tileCell.y === 0 && o === 2) {
                    _x += [0, 0, -s, -2*s][target.tileCell.x];
                }

                // Add parent tile shift
                _x += parentTile.shift.x;
                _y += parentTile.shift.y;

                // Save shift
                this.shift = {
                    x: _x,
                    y: _y
                }
            }
        }

        // Update coordinates
        this.x = x;
        this.y = y;

        // Check if tile can be set here
        if (target) this.canBeSet = this.checkCanBeSet(x, y);

        // Update SVG transform
        const _x = (this.x + 2) * size - this.y / 4 * .85 * size;
        const _y = (this.y + 2) * size + this.x / 4 * .85 * size;

        ui.setAttribute(`tile-${this.id}`, 'transform', `translate(${_x} ${_y}) rotate(${this.rotation * 90}) translate(${-2 * size} ${-2 * size})`);

        if (this.canBeSet) {
            ui.addClass(`tile-${this.id}`, 'valid');
            ui.removeClass(`tile-${this.id}`, 'invalid');
        } else {
            ui.addClass(`tile-${this.id}`, 'invalid');
            ui.removeClass(`tile-${this.id}`, 'valid');
        }
    }

    /**
    * Rotate tile
    * @param  {int} turns 90° rotation (positive = clockwise, negative = counterclockwise)
    */
    rotate(turns) {
        this.rotation = (this.rotation + turns + 4) % 4;
    }

    /**
    * Check if tile can be set at these coordinates
    * @param  {int} x column
    * @param  {int} y row
    */
    checkCanBeSet(x, y) {
        if (this.id === 0) return false;

        // Check if the tile is covering any fixed tile
        for (let i = 0; i < 4; i += 1) {
            for (let j = 0; j < 4; j += 1) {
                const cell = board.get(x + i, y + j);
                if (!cell.isEmpty()) return false;
            }
        }

        // Make sure cell next to enter is a gate
        const nextToEnter = this.getGatePlusOne(x, y, this.getOrientation());
        const cellNextToEnter = board.get(nextToEnter.x, nextToEnter.y);
        if (!cellNextToEnter.isEmpty()) {
            if (cellNextToEnter.item.type !== 'gate') {
                return false;
            } else {
                // There is a gate, make sure it has a hero on it with the same color
                for (let hero of heroes.all) {
                    if (hero.cell.x === nextToEnter.x && hero.cell.y === nextToEnter.y && hero.color === cellNextToEnter.item.color) {
                        return true;
                    } else {
                        // Purple hero is standing on an used crystal
                        const cell = board.get(hero.cell.x, hero.cell.y);
                        if (cell.item && cell.item.type === 'crystal' && cell.item.color === hero.color && !cell.isUsed()) {
                            return true;
                        }
                    }
                }
            }
        } else {
            // No item in this cell
            return false;
        }
    }

    /**
    * Get orientation of tile depending on enter position (top, right, bottom, left)
    * @return {int} base rotation of tile
    */
    getOrientation() {
        // Find X coordinate of enter
        const enter = this.findItem('enter');
        const i = enter ? enter.x : 0;

        // Determine rotation
        let r = [0, 3, 1, 2][i];
        r += this.rotation;
        r %= 4;

        return r;
    }

    /**
    * Get tile "gate+1" coordinates (cell out of tile)
    * @param  {int}    x mouse X coordinate
    * @param  {int}    y mouse Y coordinate
    * @param  {int}    o tile orientation
    * @return {Object}   {x, y}
    */
    getGatePlusOne(x, y, o) {        
        x += [1, 4, 2, -1][o];
        y += [-1, 1, 4, 2][o];

        return { x, y };
    }

    /**
    * Get tile enter coordinates (cell inside tile)
    * @param  {int}    x mouse X coordinate
    * @param  {int}    y mouse Y coordinate
    * @param  {int}    b gate X coordinate
    * @return {Object}   {x, y}
    */
    getEnter(x, y, b) {
        x += [-1, 1, -1, 1][b];
        y += [1, 1, -1, -1][b];
        return { x, y };
    }

    /**
    * Get tile "exit+1" coordinates (cell out of tile)
    * @param  {int}    x exit X coordinate
    * @param  {int}    y exit Y coordinate
    * @return {Object}   {x, y}
    */
    getExitPlusOne(x, y) {
        let corner;
        // Corners pattern:
        // 0 -- 1
        // |    |
        // 3 -- 2

        if (x === 0) {
            corner = y === 0 ? 0 : 3;
        } else if (x === 3) {
            corner = y === 0 ? 1 : 2;
        }

        let _x = [0, 1, 0, -1][corner];
        let _y = [-1, 0, 1, 0][corner];

        return { x: _x, y: _y };
    }

    /**
    * Get tile origin coordinates (top left cell)
    * @param  {int}    x mouse X coordinate
    * @param  {int}    y mouse Y coordinate
    * @param  {int}    b gate X coordinate
    * @return {Object}   {x, y}
    */
    getOrigin(x, y, o) {
        x += [-2, -3, -1, 0][o];
        y += [0, -2, -3, -1][o];

        return { x, y };
    }

    set(x, y) {
        this.move(x, y);
        this.status = 'set';
        this.saveToBoard(x, y);
        tiles.setTile(this.id);

        ui.removeClass(`tile-${this.id}`, 'valid invalid');

        this.display();
    }

    saveToBoard(x, y) {
        const r = this.rotation;

        for (let i = 0; i < 4; i += 1) {
            for (let j = 0; j < 4; j += 1) {
                let cell;

                // Save cells depending on rotation
                if (r === 0) {
                    cell = this.data[j][i];
                } else if (r === 1) {
                    cell = this.data[3 - i][j];
                } else if (r === 2) {
                    cell = this.data[3 - j][3 - i];
                } else if (r === 3) {
                    cell = this.data[i][3 - j];
                }

                // Rotate walls according to tile rotation
                // (ex.: top wall becomes left wall after rotation)
                let walls = ['top', 'right', 'bottom', 'left'];
                const boardWalls = {
                    top:    cell.walls[walls[(4 - r) % 4]],
                    right:  cell.walls[walls[(5 - r) % 4]],
                    bottom: cell.walls[walls[(6 - r) % 4]],
                    left:   cell.walls[walls[(3 - r) % 4]]
                }

                // Copy data
                let boardCell = Object.assign({}, cell);
                boardCell.tileID = this.id;
                boardCell.tileCell = {
                    x: i,
                    y: j
                }

                // Save rotated walls
                boardCell.walls = boardWalls;

                // Save escalator positions relative to board
                if (cell.escalator) {
                    let esc = Object.assign({}, cell.escalator);
                    const _esc = {
                        x: x + [esc.x, - esc.y, - esc.x, esc.y][r] + [0, 3, 3, 0][r],
                        y: y + [esc.y, esc.x, - esc.y, - esc.x][r] + [0, 0, 3, 3][r]
                    }
                    esc.x = _esc.x;
                    esc.y = _esc.y;
                    boardCell.escalator = Object.assign({}, esc);
                }

                // Save data
                board.save(x + i, y + j, boardCell);
                socket.emit('board', {
                    x: x + i,
                    y: y + j,
                    cell: boardCell
                });
            }
        }
    }

    /**
    * Find an item by key
    * @param  {string} key  string to look for
    * @return {Object}      cell coordinates of item
    */
    findItem(key) {
        for (let row in this.data) {
            row = parseInt(row);
            for (let col in this.data[row]) {
                col = parseInt(col);
                const item = this.data[row][col].item;
                if (item && item.type === key) {
                    const pos = {
                        x: row,
                        y: col
                    }
                    return pos;
                }
            }
        }
    }

    display() {
        // p5.push();
        // // Rotate and translate tile
        // p5.rotate(this.rotation * p5.PI / 2);
        // const x = this.x;
        // const y = this.y;
        // const r = this.rotation;
        // let _x = [x, y, - x - 4, - y - 4][r] * size;
        // let _y = [y, - x - 4, - y - 4, x][r] * size;
        // let _x = x * size;
        // let _y = y * size;

        // // Shift adjustment for images
        // const shift = this.shift;
        // _x += [shift.x, shift.y, -shift.x, -shift.y][r];
        // _y += [shift.y, -shift.x, -shift.y, shift.x][r];
        // p5.translate(_x, _y);

        // // Display image of cell
        // p5.image(tilesImages[this.id], 0, 0, 4 * size, 4 * size);

        // // Colored overlay depending on status
        // p5.noStroke();
        // if (this.canBeSet && this.status !== 'set') {
        //     p5.fill(240, 255, 250, 100);
        //     p5.rect(0, 0, 4 * size, 4 * size);
        // } else if (!this.canBeSet && this.status !== 'set') {
        //     p5.fill(255, 240, 245, 180);
        //     p5.rect(0, 0, 4 * size, 4 * size);
        // }

        // p5.pop();

        // if (this.status === 'set') this.displayItems();

        // const svg = `<image id="tile-${this.id}" href="./img/tile${this.id}.jpg" height="${4 * config.size}" width="${4 * config.size}" transform="translate(${_x} ${_y}) rotate(${this.rotation * 90}) translate(${-2 * size} ${-2 * size})"/>`;
        // ui.addHTML('board', svg);
    }

    createSVG() {
        // this.move(0, 0);

        const svg = `<image id="tile-${this.id}" href="./img/tile${this.id}.jpg" height="${4 * config.size}" width="${4 * config.size}"/>`;

        ui.addHTML('board', svg);
    }

    removeSVG() {
        ui.remove(`tile-${this.id}`);
        this.x = null;
        this.y = null;
    }

    displayItems() {
        for (let j = 0; j < 4; j += 1) {
            for (let i = 0; i < 4; i += 1) {
                const cell = board.get(this.x + i, this.y + j);
                if (cell.isUsed()) {
                    const shift = this.shift;
                    const x = (cell.coord.x + 1 / 3 + [.25, .1, -.1, -.25][i]) * size + shift.x;
                    const y = (cell.coord.y + 1 / 3 + [.25, .1, -.1, -.25][j]) * size + shift.y;

                    p5.push();
                    p5.translate(x, y);
                    p5.image(usedImage, 0, 0, size / 3, size / 3);
                    p5.pop();
                }
            }
        }
    }
}
