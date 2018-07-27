import board from './board';
import config from './config';
import symbols from './symbols';
import pieces from './pieces';

const size = config.size;
let tileCount = 0;

export default class Tile {
    constructor(id) {
        this.id = id;
        this.data = json[id]
        this.rotate = 0;
        this.canBeSet = false;
        this.fixed = false;
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
        const enter = this.getEnter(x, y, o);
        const target = board.getCell(enter.x, enter.y);

        // Compute shift
        if (!config.debug && target) {
            const parentTile = tiles[target.tileCount];

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
                if (board.getCell(x + i, y + j)) {
                    if (Object.keys(board.getCell(x + i, y + j)).length > 0) {
                        return false;
                    }
                }
            }
        }

        // Make sure cell next to enter is a bridge
        const nextToEnter = this.getEnter(x, y, this.getOrientation());
        const cellNextToEnter = board.getCell(nextToEnter.x, nextToEnter.y);
        if (Object.keys(cellNextToEnter).length > 0) {
            if (cellNextToEnter.item.type !== 'bridge') {
                return false;
            } else {
                // There is a bridge, make sure it has a hero on it with the same color
                for (let piece of pieces.all) {
                    if (piece.cell.x === nextToEnter.x && piece.cell.y === nextToEnter.y) {
                        if (piece.color === cellNextToEnter.item.color) {
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
        let i;

        // Find x coordinate of enter
        if (this.findItem('enter')) {
            i = this.findItem('enter').x;
        } else {
            i = 0;
        }

        // Determine rotation
        let r = [0, 3, 1, 2][i];
        r += this.rotate;
        r %= 4;

        return r;
    }

    /**
    * Get tile entrance coordinates (cell out of tile)
    * @param  {int}   x mouse X coordinate
    * @param  {int}   y mouse Y coordinate
    * @param  {int}   o tile orientation
    * @return {Objet}   {x, y}
    */
    getEnter(x, y, o) {
        x += [2, 4, 1, -1][o];
        y += [-1, 2, 4, 1][o];

        return {x: x, y: y}
    }

    set(x, y) {
        this.move(x, y);
        this.fixed = true;
        this.saveToBoard(x, y);
    }

    saveToBoard(x, y) {
        const r = this.rotate;

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
                // boardCell.tileID = this.id;
                boardCell.tileCount = tileCount;
                boardCell.tileCell = {
                    x: i,
                    y: j
                }

                // Save rotated walls
                boardCell.walls = boardWalls;

                // Save escalator positions relative to board
                let esc = Object.assign({}, cell.escalator);
                if (Object.keys(esc).length > 0) {
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

        tileCount++;
    }

    /**
    * Find an item by key
    * @param  {string} key  string to look for
    * @return {Object}      cell coordinates of item
    */
    findItem(key) {
        for (let row in this.data) {
            for (let col in this.data[row]) {
                if (this.data[row][col].item.type === key) {
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
        p5.push();
        // Rotate and translate tile
        p5.rotate(this.rotate * p5.PI/2);
        const x = this.x;
        const y = this.y;
        const r = this.rotate;
        let _x = [x, y, - x - 4, - y - 4][r] * size;
        let _y = [y, - x - 4, - y - 4, x][r] * size;
        if (config.debug) {
            // Pixel adjustment for schemas
            _x -= [0, 0, 1, 1][r];
            _y -= [0, 1, 1, 0][r];
        } else {
            // Shift adjustment for images
            const shift = this.shift;
            _x += [shift.x, shift.y, -shift.x, -shift.y][r];
            _y += [shift.y, -shift.x, -shift.y, shift.x][r];
        }
        p5.translate(_x, _y);

        if (config.debug) { // Display schema of cell
            p5.blendMode(p5.MULTIPLY);

            // Background color depending on status
            if (this.fixed) {
                p5.fill('#f0f2ff');
            } else if (this.canBeSet) {
                p5.fill('#e0ffe4');
            } else {
                p5.fill('#ffe2e4');
            }

            p5.noStroke();
            p5.rect(0, 0, size * 4, size * 4);

            p5.noFill();
            p5.stroke(0);

            // TODO: fix irrelevant tiles coordinates
            for (let i = 0; i < 4; i += 1) {
                for (let j = 0; j < 4; j += 1) {
                    // For each cell
                    p5.push();
                    p5.translate(j * size, i * size);

                    // Draw basic gid
                    p5.stroke(240);
                    p5.rect(0, 0, size, size);
                    p5.stroke(0);

                    // Get cell data
                    if (!this.data) return;
                    let cell = this.data[i][j];

                    // Add item to cell
                    let item = cell.item;
                    if (item) {
                        if (item.type === 'vortex') {
                            p5.fill(config.colors[item.color]);
                            p5.noStroke();
                            p5.ellipse(size / 2, size / 2, size / 2, size / 2);
                            p5.stroke(0);
                        } else if (item.type === 'bridge' || item.type === 'enter') {
                            // Set color (for bridge)
                            if (item.color) p5.stroke(item.color);

                            // Rotate and draw item depending on cell coordinates
                            p5.push();
                            if (i === 0) {
                                // Pointing up
                                symbols.arrow(item.type);
                            } else if (i === 3) {
                                // Pointing bottom
                                p5.translate(size, size);
                                p5.rotate(p5.PI);
                                symbols.arrow(item.type);
                            } else if (j === 0) {
                                // Pointing left
                                p5.translate(0, size);
                                p5.rotate(-p5.PI / 2);
                                symbols.arrow(item.type);
                            } else if (j === 3) {
                                // Pointing right
                                p5.translate(size, 0);
                                p5.rotate(p5.PI / 2);
                                symbols.arrow(item.type);
                            }
                            p5.pop();
                        }
                    }

                    let esc = cell.escalator;
                    if (esc) {
                        p5.stroke(0,0,255);
                        const x1 = size / 2;
                        const y1 = size / 2;
                        const x2 = size / 2 + (esc.x - j) * size;
                        const y2 = size / 2 + (esc.y - i) * size;
                        p5.line(x1, y1, x2, y2);
                    }

                    // Draw walls
                    p5.blendMode(p5.MULTIPLY);
                    p5.stroke(0);
                    if (cell.walls.top) {
                        p5.line(0, 0, size, 0);
                    }
                    if (cell.walls.right) {
                        p5.line(size, 0, size, size);
                    }
                    if (cell.walls.bottom) {
                        p5.line(0, size, size, size);
                    }
                    if (cell.walls.left) {
                        p5.line(0, 0, 0, size);
                    }

                    p5.pop();
                }
            }
        } else { // Display image of cell
            p5.image(tilesImages[this.id], 0, 0, 4 * size, 4 * size);

            // Colored overlay depending on status
            p5.noStroke();
            if (this.canBeSet && !this.fixed) {
                p5.fill(240, 255, 250, 100);
                p5.rect(0, 0, 4 * size, 4 * size);
            } else if (!this.canBeSet && !this.fixed) {
                p5.fill(255, 240, 245, 180);
                p5.rect(0, 0, 4 * size, 4 * size);
            }
        }

        if (this.fixed) this.displayItems();

        p5.pop();
    }

    displayItems() {
        for (let j = 0; j < Object.keys(this.data).length; j += 1) {
            for (let i = 0; i < Object.keys(this.data[j]).length; i += 1) {
                const cell = board.getCell(this.x + i, this.y + j);
                if (cell.item.used) {
                    p5.translate((i + .25) * size, (j + .25) * size);
                    p5.image(usedImage, 0, 0, size / 2, size / 2);
                }
            }
        }
    }
}
