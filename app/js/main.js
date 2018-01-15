let zoom = 2;
let targetZoom = zoom;

let tiles = [];
let json;

let x = 0;
let y = 0;

let board = {};

const config = {
    'debug': false,
    'cameraSpeed': 5,
    'boardRows': 24,
    'boardCols': 24
}

const size = 32;

function setup() {
    createCanvas(windowWidth, windowHeight);

    for (let i = 0; i < config.boardCols; i += 1) {
        board[i] = {};
        for (let j = 0; j < config.boardRows; j += 1) {
            board[i][j] = {};
        }
    }

    fetch('/data/tiles.json').then(response => response.json()).then(data => {
        json = data;
        tiles.push(new Tile(0));
        tiles[0].set(10, 10);
    });

    x = - config.boardCols / 2 * size;
    y = - config.boardRows / 2 * size;
}

function draw() {
    background(255);

    // Zoom with focus point at the center of screen
    translate(width/2, height/2);
    cameraZoom();

    push();
    cameraPan();

    if (config.debug) {
        grid();
    }

    // Display tiles
    displayTiles();

    pop();
}

class Tile {
    constructor(id) {
        this.data = json[id];
        this.rotate = 0;
        this.fixed = false;
        this.canBeSet = false;
    }

    move(x, y) {
        // Position hasn't changed
        if (x === this.x && y === this.y) return;

        // Else, update coordinates
        this.x = x;
        this.y = y;

        this.checkCanBeSet(x, y);
    }

    /**
    * Check if tile can be set at these coordinates
    * @param  {int} x column
    * @param  {int} y row
    */
    checkCanBeSet(x, y) {
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
        if (findItemInTile(this, 'enter')) {
            i = findItemInTile(this, 'enter').x;
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

    display() {
        push();

        // Rotate and translate tile
        rotate(tile.rotate * PI/2);
        if (tile.rotate === 0) {
            translate(this.x * size, this.y * size);
        } else if (tile.rotate === 1) {
            translate(this.y * size, -((this.x + 4) * size + 1));
        } else if (tile.rotate === 2) {
            translate(-((this.x + 4) * size + 1), -((this.y + 4) * size + 1));
        } else if (tile.rotate === 3) {
            translate(-((this.y + 4) * size + 1), this.x * size);
        }

        blendMode(MULTIPLY);

        // Background color
        if (this.fixed) {
            fill('#f0f2ff');
        } else if (this.canBeSet) {
            fill('#e0ffe4');
        } else {
            fill('#ffe2e4');
        }

        noStroke();
        rect(0, 0, size * 4, size * 4);

        noFill();
        stroke(0);

        for (let i = 0; i < 4; i += 1) {
            for (let j = 0; j < 4; j += 1) {
                // For each cell
                push();
                translate(j*size, i*size);

                // Draw basic grid
                stroke(240);
                rect(0, 0, size, size);
                stroke(0);

                // Get cell data
                let cell = this.data[i][j];

                // Add item to cell
                let item = cell.item;
                if (item) {
                    if (item.type === 'vortex') {
                        fill(item.color);
                        noStroke();
                        ellipse(size/2, size/2, size/2, size/2);
                        stroke(0);
                    } else if (item.type === 'bridge' || item.type === 'enter') {
                        // Set color (for bridge)
                        if (item.color) stroke(item.color);

                        // Rotate and draw item depending on cell coordinates
                        if (i === 0) {
                            // Pointing up
                            arrow(item.type);
                        } else if (i === 3) {
                            // Pointing bottom
                            push();
                            rotate(PI);
                            translate(-size, -size);
                            arrow(item.type);
                            pop();
                        } else if (j === 0) {
                            // Pointing left
                            push();
                            translate(0, size);
                            rotate(-PI/2);
                            arrow(item.type);
                            pop();
                        } else if (j === 3) {
                            // Pointing right
                            push();
                            translate(size, 0);
                            rotate(PI/2);
                            arrow(item.type);
                            pop();
                        }
                    }
                }

                let esc = cell.escalator;
                if (esc) {
                    stroke(0,0,255);
                    const x1 = size/2;
                    const y1 = size/2;
                    const x2 = size/2 + (esc.y - j)*size;
                    const y2 = size/2 + (esc.x - i)*size;
                    line(x1, y1, x2, y2);
                }

                // Draw walls
                blendMode(MULTIPLY);
                stroke(0);
                if (cell.topWall) {
                    line(0, 0, size, 0);
                }
                if (cell.rightWall) {
                    line(size, 0, size, size);
                }
                if (cell.bottomWall) {
                    line(0, size, size, size);
                }
                if (cell.leftWall) {
                    line(0, 0, 0, size);
                }

                pop();
            }
        } // end of cell

        pop();
    }
}

/**
* Animate camera zoom
*/
function cameraZoom() {
    if (abs(targetZoom - zoom) > .005) {
        zoom += (targetZoom - zoom) / 15;
    } else {
        zoom = targetZoom
    }
    scale(zoom);
}

/**
* Move camera around
*/
function cameraPan() {
    if (keyIsDown(90)) { // Z: move up
        y += config.cameraSpeed;
    }
    if (keyIsDown(81)) { // Q: move left
        x += config.cameraSpeed;
    }
    if (keyIsDown(83)) { // S: move down
        y -= config.cameraSpeed;
    }
    if (keyIsDown(68)) { // D: move right
        x -= config.cameraSpeed;
    }

    translate(x, y);
}

/**
* General key press actions
* @param {Object} e event
*/
function keyPressed(e) {
    if (e.which === 65) { // A: zoom out
        if (targetZoom > 1) targetZoom /= 1.5;
    } else if (e.which === 69) { // E: zoom in
        targetZoom *= 1.5;
    } else if (e.which === 67) { // C: engage tile setting
        pushNewTile();
    } else if (e.which === 82) { // R: rotate tile counterclockwise
        rotateNewTile(-1);
    } else if (e.which === 84) { // T: rotate tile clockwise
        rotateNewTile(1);
    }
}

/**
* Draw an arrow
*/
function arrow(type) {
    if (type === 'bridge') {
        // Linear arrow
        blendMode(NORMAL);
        line(size/2, size/4, size/2, size/1.5);
        line(size/2, size/4, size/3, size/2.5);
        line(size/2, size/4, size/1.5, size/2.5);
        blendMode(MULTIPLY);
    } else if (type === 'enter') {
        // Filled arrow
        strokeJoin(ROUND);
        strokeCap(ROUND);
        stroke(150);
        fill(255);
        beginShape();
        vertex(size/2.25, size/3);
        vertex(size/2.25, size/4);
        vertex(size/1.7, size/4);
        vertex(size/1.7, size/3);
        vertex(size/1.5, size/3);
        vertex(size/1.93, size/2);
        vertex(size/2.75, size/3);
        vertex(size/2.75, size/3);
        endShape(CLOSE);
    }
}

/**
* Draw background grid
*/
function grid() {
    for (let i = 0; i < config.boardCols; i += 1) {
        for (let j = 0; j < config.boardRows; j += 1) {
            push();
            translate(i*size, j*size);

            // Draw cell
            stroke(240);
            rect(0, 0, size, size);

            // Add coordinates as text
            fill(150);
            noStroke();
            textSize(8);
            text(i + ':' + j, 6, 20);

            pop();
        }
    }
}

let oldCell;

/**
* Get hovered cell coordinates
* @return {Object} position {x: ,y: }
*/
function mouseCell() {
    const i = floor((mouseX - width/2 - (x * zoom)) / (size * zoom));
    const j = floor((mouseY - height/2 - (y * zoom)) / (size * zoom));

    const cell = {
        'x': i,
        'y': j
    }
    if (cell === oldCell) {
        return;
    } else {
        oldCell = cell;
        return cell;
    }
}

function mousePressed() {
    // Select tile being set
    const tile = tiles[tiles.length-1];
    const mC = mouseCell();
    const o = tile.getOrientation();

    if (tile.canBeSet && !tile.fixed) {
        if (o === 0) {
            tile.set(mC.x - 2, mC.y);
        } else if (o === 1) {
            tile.set(mC.x - 3, mC.y - 2);
        } else if (o === 2) {
            tile.set(mC.x - 1, mC.y - 3);
        } else if (o === 3) {
            tile.set(mC.x, mC.y - 1);
        }
    }
}

/**
* Push new tile to tiles array
*/
function pushNewTile() {
    // Select tile being set
    const tile = tiles[tiles.length-1];

    // Make sure last tile is fixed to prevent multiple tiles setting
    if (tile.fixed) {
        tiles.push(new Tile(tiles.length));
    }
}

/**
* Rotate tile being set
* @param  {int} dir direction (1 for clockwise, -1 for counterclockwise)
*/
function rotateNewTile(dir) {
    // Select tile being set
    const tile = tiles[tiles.length-1];

    // Make sure tile is not fixed
    if (!tile.fixed) {
        if (dir === 1) {
            // Rotate clockwise
            tile.rotate < 3 ? tile.rotate += dir : tile.rotate = 0;
        } else if (dir === -1) {
            // Rotate counterclockwise
            tile.rotate > 0 ? tile.rotate += dir : tile.rotate = 3;
        }
    }
}

/**
* Display all tiles
*/
function displayTiles() {
    for (tile of tiles) {
        // Tiles is being placed, move it along cursor position
        if (!tile.fixed) {
            // Mouse cell
            const mC = mouseCell();
            const o = tile.getOrientation();

            // Place cursor on enter cell depending on orientation
            let x = mC.x + [-2, -3, -1, 0][o];
            let y = mC.y + [0, -2, -3, -1][o];
            tile.move(x, y);
        }

        // Display tile
        tile.display();
    }
}

/**
* Find an item by key
* @param  {Object} tile tile to inspect
* @param  {string} key  string to look for
* @return {Object}      cell coordinates of item
*/
function findItemInTile(tile, key) {
    for (row in tile.data) {
        for (col in tile.data[row]) {
            if (tile.data[row][col].item.type === key) {
                const pos = {
                    x: row,
                    y: col
                }
                return pos;
            }
        }
    }
}
