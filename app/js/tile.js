import board from './board';
import config from './config';
import symbols from './symbols';

const size = config.size

export default class Tile {
    constructor(id) {
        this.id = id;
        this.data = json[id]
        this.rotate = 0;
        this.canBeSet = false;
        this.fixed = false;
    }

    move(x, y) {
        // Position hasn't changed
        if (x === this.x && y === this.y) return;

        // Else, update coordinates
        this.x = x;
        this.y = y;

        this.checkCanBeSet(this.x, this.y);
    }

    /**
    * Check if tile can be set at these coordinates
    * @param  {int} x column
    * @param  {int} y row
    */
    checkCanBeSet(x, y) {
        if (this.id === 0) return;

        // Set to true by default
        this.canBeSet = true;

        // Prevent bounds overflow
        if (x < 0 || y < 0 || x > 15 || y > 15) {
            this.canBeSet = false;
            return;
        }

        // Check if the tile is covering any fixed tile
        for (let i = 0; i < 4; i += 1) {
            for (let j = 0; j < 4; j += 1) {
                if (board[x + i] && board[x + i][y + j]) {
                    if (Object.keys(board[x + i][y + j]).length > 0) {
                        this.canBeSet = false;
                    }
                }
            }
        }

        // Get cell next to entrance coordinates
        const nextToEnter = this.getEnter(x, y, this.getOrientation());

        const cellNextToEnter = board[nextToEnter.x][nextToEnter.y];
        // console.log(nextToEnter.x, nextToEnter.y);

        if (Object.keys(cellNextToEnter).length > 0) {
            if (cellNextToEnter.item.type !== 'bridge') {
                this.canBeSet = false;
            }
        } else {
            this.canBeSet = false;
        }
    }

    /**
    * Get orientation of tile depending on enter position
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
        r += this.rotate
        r %= 4;

        return r;
    }

    // /**
    // * Get tile top left corner coordinates
    // * @param  {int}   x mouse X coordinate
    // * @param  {int}   y mouse Y coordinate
    // * @param  {int}   o tile orientation
    // * @return {Objet}   {x, y}
    // */
    // getTopLeftCorner(x, y, o) {
    //     let _x;
    //     let _y;
    //     console.log(x, y, o);
    //
    //     if (o === 0) {
    //         _x = x;
    //         _y = y;
    //     } else if (o === 1) {
    //         _x = x - 3;
    //         _y = y - 2;
    //     } else if (o === 2) {
    //         _x = x - 3;
    //         _y = y;
    //     } else if (o === 3) {
    //         _x = x - 3;
    //         _y = y - 3;
    //     }
    //
    //     return {x: _x, y: _y}
    // }

    /**
    * Get tile entrance coordinates
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

                // Save cells depending on rotation
                if (r === 0) {
                    board[x + i][j + y] = this.data[j][i];
                } else if (r === 1) {
                    board[x + i][j + y] = this.data[3 - i][j];
                } else if (r === 2) {
                    board[x + i][j + y] = this.data[3 - j][3 - i];
                } else if (r === 3) {
                    board[x + i][j + y] = this.data[i][3 - j];
                }
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
        if (this.rotate === 0) {
            p5.translate(this.x * size, this.y * size);
        } else if (this.rotate === 1) {
            p5.translate(this.y * size, -((this.x + 4) * size));
        } else if (this.rotate === 2) {
            p5.translate(-((this.x + 4) * size), -((this.y + 4) * size));
        } else if (this.rotate === 3) {
            p5.translate(-((this.y + 4) * size), this.x * size);
        }

        if (config.debug) {

            p5.blendMode(p5.MULTIPLY);

            // Background color
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

            for (let i = 0; i < 4; i += 1) {
                for (let j = 0; j < 4; j += 1) {
                    // For each cell
                    p5.push();
                    p5.translate(j*size, i*size);

                    // Draw basic grid
                    // p5.stroke(240);
                    // p5.rect(0, 0, size, size);
                    p5.stroke(0);

                    if (!this.data) return;

                    // Get cell data
                    let cell = this.data[i][j];

                    // Add item to cell
                    let item = cell.item;
                    if (item) {
                        if (item.type === 'vortex') {
                            p5.fill(item.color);
                            p5.noStroke();
                            p5.ellipse(size/2, size/2, size/2, size/2);
                            p5.stroke(0);
                        } else if (item.type === 'bridge' || item.type === 'enter') {
                            // Set color (for bridge)
                            if (item.color) p5.stroke(item.color);

                            // Rotate and draw item depending on cell coordinates
                            if (i === 0) {
                                // Pointing up
                                symbols.arrow(item.type);
                            } else if (i === 3) {
                                // Pointing bottom
                                p5.push();
                                p5.rotate(p5.PI);
                                p5.translate(-size, -size);
                                symbols.arrow(item.type);
                                p5.pop();
                            } else if (j === 0) {
                                // Pointing left
                                p5.push();
                                p5.translate(0, size);
                                p5.rotate(-p5.PI/2);
                                symbols.arrow(item.type);
                                p5.pop();
                            } else if (j === 3) {
                                // Pointing right
                                p5.push();
                                p5.translate(size, 0);
                                p5.rotate(p5.PI/2);
                                symbols.arrow(item.type);
                                p5.pop();
                            }
                        }
                    }

                    let esc = cell.escalator;
                    if (esc) {
                        p5.stroke(0,0,255);
                        const x1 = size/2;
                        const y1 = size/2;
                        const x2 = size/2 + (esc.y - j)*size;
                        const y2 = size/2 + (esc.x - i)*size;
                        p5.line(x1, y1, x2, y2);
                    }

                    // Draw walls
                    p5.blendMode(p5.MULTIPLY);
                    p5.stroke(0);
                    if (cell.topWall) {
                        p5.line(0, 0, size, 0);
                    }
                    if (cell.rightWall) {
                        p5.line(size, 0, size, size);
                    }
                    if (cell.bottomWall) {
                        p5.line(0, size, size, size);
                    }
                    if (cell.leftWall) {
                        p5.line(0, 0, 0, size);
                    }

                    p5.pop();
                }
            } // end of cell
        } else {
            let x = 0;
            let y = 0;

            // @TODO: adjust x and y depending so illustrations fit together

            p5.image(tilesImages[this.id], x, y, 4*size, 4*size);

            p5.noStroke();
            if (this.canBeSet && !this.fixed) {
                p5.fill(240, 255, 250, 100);
                p5.rect(x, y, 4*size, 4*size);
            } else if (!this.canBeSet && !this.fixed) {
                p5.fill(255, 240, 245, 180);
                p5.rect(x, y, 4*size, 4*size);
            }
        }

        p5.pop();
    }
}
