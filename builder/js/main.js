const config = {
    size: 100,
    tolerance: 4,
    colors: {
        green: '#57bd6a',
        orange: '#e87b1a',
        purple: '#961c91',
        yellow: '#f7dc0a'
    }
}

let canvas;
let tile;
let tool = 'wall'; // wall, enter, gate, vortex
let color = 'green';
let p1 = false;
let p2 = false;

function setup() {
    canvas = createCanvas(500, 500);
    tile = new Tile();
}

function draw() {
    background('255');
    translate(width / 2 - config.size * 2, height / 2 - config.size * 2);

    // Background grid
    grid();

    // Display tile
    tile.display();
}

function mousePressed() {
    const mouseCell = getHoveredCell();
    if (!mouseCell) return;
    const cell = tile.layout[mouseCell.x][mouseCell.y];
    const x = cell.coord.x;
    const y = cell.coord.y;

    if (tool === 'wall' || tool === 'wall-orange') {
        const side = getHoveredSide(mouseCell);
        if (!side) return;
        let state = cell.walls[side];

        if (tool === 'wall-orange') {
            if (state === true || state === false) {
                state = 'orange';
            } else if (state === 'orange') {
                state = false;
            }
        } else {
            if (state === 'orange') {
                state = true
            } else {
                state = !state;
            }
        }

        // Add/remove wall
        cell.walls[side] = state;


        // Add/remove same wall to neighbour cell
        if (side === 'top' && tile.layout[x][y - 1]) {
            tile.layout[x][y - 1].walls.bottom = state;
        } else if (side === 'right' && tile.layout[x + 1]) {
            tile.layout[x + 1][y].walls.left = state;
        } else if (side === 'bottom' && tile.layout[x][y + 1]) {
            tile.layout[x][y + 1].walls.top = state;
        } else if (side === 'left' && tile.layout[x - 1]) {
            tile.layout[x - 1][y].walls.right = state;
        }
    } else if (tool === 'escalator') {
        if (!p1) {
            p1 = {x: x, y: y};
        } else if (!p2) {
            // Escalator can't go to same cell
            if (x === p1.x && y === p1.y) return;

            p2 = {x: x, y: y};

            tile.layout[p1.x][p1.y].escalator = {x: p2.x, y: p2.y};
            tile.layout[p2.x][p2.y].escalator = {x: p1.x, y: p1.y};
        } else {
            if (tile.layout[x][y].escalator) {
                // Clicked on a cell with an escalator, remove it
                const _x = tile.layout[x][y].escalator.x;
                const _y = tile.layout[x][y].escalator.y;
                tile.layout[_x][_y].escalator = false;
                tile.layout[x][y].escalator = false;
            } else {
                p1 = {x: x, y: y};
                p2 = false;
            }
        }
    } else {
        // Enter, gate, vortex, exit & time

        // Remove item
        if (cell.item && cell.item.type === tool && ((tool === 'time' || tool === 'enter') || cell.item.color === color)) {
            cell.item = false;
            return;
        }

        // gates have only four possible cells to be set on
        if (tool === 'gate' || tool === 'enter') {
            if (!(
                (x === 0 && y === 1) ||
                (x === 1 && y === 3) ||
                (x === 2 && y === 0) ||
                (x === 3 && y === 2)
            )) return;
        }

        // Exits too but not the same
        if (tool === 'exit') {
            if (!(
                (x === 0 && y === 0) ||
                (x === 0 && y === 3) ||
                (x === 3 && y === 0) ||
                (x === 3 && y === 3)
            )) return;
        }

        // All gates and vortexes should have a color
        if ((tool === 'gate' || tool === 'vortex') && !color) return;

        // Time and enter have no color
        if (tool === 'time' || tool === 'enter') {
            cell.item = {
                'type': tool
            }
        } else {
            cell.item = {
                'type': tool,
                'color': color
            }
        }
    }
}

class Tile {
    constructor(id) {
        this.x = 0;
        this.y = 0;
        this.layout = {};

        for (let i = 0; i < 4; i += 1) {
            this.layout[i] = {};

            for (let j = 0; j < 4; j += 1) {
                this.layout[i][j] = new Cell(i, j);
            }
        }
    }

    display() {
        fill('#f5faff');

        for (let i = 0; i < 4; i += 1) {
            for (let j = 0; j < 4; j += 1) {
                // For each cell
                const cell = this.layout[i][j];

                push();
                translate(i * config.size, j * config.size);

                // Draw basic grid
                blendMode(MULTIPLY);
                stroke(240);
                strokeWeight(2);
                rect(0, 0, config.size, config.size);

                stroke(0);

                // Add item to cell
                let item = cell.item;
                if (item) {
                    if (item.type === 'vortex') {
                        fill(config.colors[item.color]);
                        noStroke();
                        ellipse(config.size/2, config.size/2, config.size/2, config.size/2);
                        stroke(0);
                    } else if (item.type === 'article') {
                        noStroke();
                        fill(config.colors[item.color]);
                        star(config.size / 2, config.size / 2, 10, 25, 5);
                    } else if (item.type === 'crystal') {
                        stroke(config.colors['purple']);
                        star(config.size / 2, config.size / 2, 28, 32, 20);
                    } else if (item.type === 'camera') {
                        stroke(0, 0, 0);
                        fill(255, 200, 0);
                        polygon(config.size / 2, config.size / 2, 32, 6);
                    } else if (item.type === 'gate' || item.type === 'enter' || item.type === 'exit') {
                        // Set color (for gate & exit)
                        if (config.colors[item.color]) {
                            fill(config.colors[item.color]);
                            stroke(config.colors[item.color]);
                        }

                        if (j === 0 && i < 3) {
                            arrow(item.type);
                        } else if (j === 3 && i > 0) {
                            push();
                            rotate(PI);
                            translate(-config.size, -config.size);
                            arrow(item.type);
                            pop();
                        } else if (i === 0) {
                            push();
                            translate(0, config.size);
                            rotate(-PI/2);
                            arrow(item.type);
                            pop();
                        } else if (i === 3) {
                            push();
                            translate(config.size, 0);
                            rotate(PI/2);
                            arrow(item.type);
                            pop();
                        }
                    } else if (item.type === "time") {
                        blendMode(NORMAL);
                        stroke(0);
                        fill(255);
                        ellipse(config.size / 2, config.size / 2, 40, 40);
                        line(config.size / 2, config.size / 2 + 2, config.size / 2 - 7, config.size / 2 - 5);
                        line(config.size / 2, config.size / 2 + 2, config.size / 2 + 10, config.size / 2 - 9);
                    }
                }

                let esc = cell.escalator;
                if (esc) {
                    stroke(0, 0, 255);
                    const x1 = config.size / 2;
                    const y1 = config.size / 2;
                    const x2 = config.size / 2 + (esc.x - i) * config.size;
                    const y2 = config.size / 2 + (esc.y - j) * config.size;
                    line(x1, y1, x2, y2);
                }

                // Draw walls
                blendMode(NORMAL);
                if (cell.walls.top) {
                    stroke(0);
                    if (cell.walls.top === 'orange') stroke(config.colors['orange']);
                    line(0, 0, config.size, 0);
                }
                if (cell.walls.right) {
                    stroke(0);
                    if (cell.walls.right === 'orange') stroke(config.colors['orange']);
                    line(config.size, 0, config.size, config.size);
                }
                if (cell.walls.bottom) {
                    stroke(0);
                    if (cell.walls.bottom === 'orange') stroke(config.colors['orange']);
                    line(0, config.size, config.size, config.size);
                }
                if (cell.walls.left) {
                    stroke(0);
                    if (cell.walls.left === 'orange') stroke(config.colors['orange']);
                    line(0, 0, 0, config.size);
                }

                pop();
            }
        }
    }
}

class Cell {
    constructor(x, y) {
        this.coord = {
            x: x,
            y: y
        };
        this.walls = {};

        // Build generic outer walls
        this.walls.top = (y === 0 && x !== 2);
        this.walls.right = (x === 3 && y !== 2);
        this.walls.bottom = (y === 3 && x !== 1);
        this.walls.left = (x === 0 && y !== 1);

        this.item = false;
        this.escalator = false;
    }
}

/**
* Draw background grid
*/
function grid() {
    for (let i = 0; i < 4; i += 1) {
        for (let j = 0; j < 4; j += 1) {
            push();
            translate(i * config.size, j * config.size);

            // Draw cell
            stroke(240);
            rect(0, 0, config.size, config.size);

            pop();
        }
    }
}

/**
* Draw an arrow
* @param  {string} type gate, enter
*/
function arrow(type) {
    if (type === 'gate') {
        // Linear arrow
        blendMode(NORMAL);
        line(config.size/2, config.size/4, config.size/2, config.size/1.5);
        line(config.size/2, config.size/4, config.size/3, config.size/2.5);
        line(config.size/2, config.size/4, config.size/1.5, config.size/2.5);
        blendMode(MULTIPLY);
    } else if (type === 'enter') {
        // Filled arrow
        strokeJoin(ROUND);
        strokeCap(ROUND);
        stroke(150);
        blendMode(NORMAL);
        fill(255);
        beginShape();
        vertex(config.size/2.25, config.size/3);
        vertex(config.size/2.25, config.size/4);
        vertex(config.size/1.7, config.size/4);
        vertex(config.size/1.7, config.size/3);
        vertex(config.size/1.5, config.size/3);
        vertex(config.size/1.93, config.size/2);
        vertex(config.size/2.75, config.size/3);
        vertex(config.size/2.75, config.size/3);
        endShape(CLOSE);
    } else if (type === 'exit') {
        // Linear arrow with rectangle
        strokeJoin(ROUND);
        strokeCap(ROUND);
        blendMode(NORMAL);
        line(config.size/2, config.size/2, config.size/2, config.size/1.4);
        line(config.size/2, config.size/2, config.size/2 - 10, config.size/1.7);
        line(config.size/2, config.size/2, config.size/2 + 10, config.size/1.7);
        rect(config.size/2 - 15, config.size/2 - 25, 30, 15);
    }
}

/**
* Draw a star
* @param  {int} x  X coordinate
* @param  {int} y  Y coordinate
* @param  {int} r1 inner radius
* @param  {int} r2 outer radius
* @param  {int} n  points (branches)
*/
function star(x, y, r1, r2, n) {
    var angle = TWO_PI / n;
    beginShape();
    for (let a = TWO_PI / (-n * 4); a <= TWO_PI; a += angle) {
        let sx = x + cos(a) * r2;
        let sy = y + sin(a) * r2;
        vertex(sx, sy);
        sx = x + cos(a + angle / 2) * r1;
        sy = y + sin(a + angle / 2) * r1;
        vertex(sx, sy);
    }
    endShape(CLOSE);
}

/**
* Draw a polygon
* @param  {int} x X coordinate
* @param  {int} y Y coordinate
* @param  {int} r radius
* @param  {int} n points (sides)
*/
function polygon(x, y, r, n) {
    let angle = TWO_PI / n;
    beginShape();

    for (let a = 0; a < TWO_PI; a += angle) {
        let sx = x + cos(a) * r;
        let sy = y + sin(a) * r;
        vertex(sx, sy);
    }
    endShape(CLOSE);
}

/**
* Get hovered cell coordinates
* @return {Object} position {x, y}
*/
function getHoveredCell() {
    const x = floor((2 * config.size + mouseX - width / 2) / config.size);
    const y = floor((2 * config.size + mouseY - width / 2) / config.size);

    if (x < 0 || x > 3 || y < 0 || y > 3) {
        return false;
    }

    return {x: x, y: y}
}

/**
* Get closest side of cell
* @return {string|bool}  top, bottom, left, right or false
*/
function getHoveredSide() {
    let side = false;
    const x = (mouseX - width / 2 + config.size * 2) % config.size;
    const y = (mouseY - width / 2 + config.size * 2) % config.size;

    // Detect closest side of cell
    if (x < config.size / config.tolerance) {
        side = 'left';
    } else if (config.size - x < config.size / config.tolerance) {
        side = 'right';
    }

    if (y < config.size / config.tolerance) {
        side = 'top';
    } else if (config.size - y < config.size / config.tolerance) {
        side = 'bottom';
    }

    return side;
}

/**
* Clear tile and restore default
*/
function clearTile() {
    for (let j = 0; j < 4; j += 1) {
        for (let i = 0; i < 4; i += 1) {
            const cell = tile.layout[i][j];

            // Remove all walls
            cell.walls = {
                'top': false,
                'right': false,
                'bottom': false,
                'left': false
            }

            // Restore generic walls
            cell.walls.top = (j === 0 && i !== 2);
            cell.walls.right = (i === 3 && j !== 2);
            cell.walls.bottom = (j === 3 && i !== 1);
            cell.walls.left = (i === 0 && j !== 1);

            // Remove item and escalator
            cell.item = false;
            cell.escalator = false;
        }
    }
}

/**
* Randomize tile walls and items
*/
function randomize() {
    clearTile();
    for (let j = 0; j < 4; j += 1) {
        for (let i = 0; i < 4; i += 1) {
            const cell = tile.layout[i][j];

            // Randomize all walls
            // cell.walls = {
            //     'top': Math.random() < .5 ? true : false,
            //     'right': Math.random() < .5 ? true : false,
            //     'bottom': Math.random() < .5 ? true : false,
            //     'left': Math.random() < .5 ? true : false
            // }
        }
    }
}

/**
* Save canvas as a 600*600 JPG image
*/
function exportImage() {
    let jpg = createGraphics(600, 600);
    jpg.image(canvas, -70, -70, 740, 740);
    save(jpg, 'tile.jpg');
}

/**
* Save tile data in JSON file
*/
function exportJSON() {
    let json = {};

    for (let i = 0; i < 4; i += 1) {
        json[i] = {};

        for (let j = 0; j < 4; j += 1) {
            json[i][j] = {};
            json[i][j].walls = {};

            json[i][j].walls.top = tile.layout[j][i].walls.top;
            json[i][j].walls.right = tile.layout[j][i].walls.right;
            json[i][j].walls.bottom = tile.layout[j][i].walls.bottom;
            json[i][j].walls.left = tile.layout[j][i].walls.left;

            json[i][j]['item'] = tile.layout[j][i].item;
            json[i][j]['escalator'] = tile.layout[j][i].escalator;
        }
    }

    save(json, 'tile.json');
}

/**
* General click actions
*/

$(document).on('click', 'ul li', (e) => {
    const $el = $(e.currentTarget);

    if ($el.attr('data-color')) {
        color = $el.attr('data-color');
    } else if ($el.attr('data-tool')) {
        tool = $el.attr('data-tool');
    }

    updateUI();
});

$(document).on('click', 'button[name="clear"]', () => {
    clearTile();
});

$(document).on('click', 'button[name="random"]', () => {
    randomize();
});

$(document).on('click', 'button[name="export"]', () => {
    exportImage();
    exportJSON();
});

/**
* General key press actions
* @param {Object} e event
*/
function keyPressed(e) {
    if (keyIsDown(49)) { // 1
        tool = 'wall';
    } else if (keyIsDown(50)) { // 2
        tool = 'wall-orange';
    } else if (keyIsDown(51)) { // 3
        tool = 'enter';
    } else if (keyIsDown(52)) { // 4
        tool = 'gate';
    } else if (keyIsDown(53)) { // 5
        tool = 'vortex';
    } else if (keyIsDown(54)) { // 6
        tool = 'article';
    } else if (keyIsDown(55)) { // 7
        tool = 'exit';
    } else if (keyIsDown(56)) { // 8
        tool = 'time';
    } else if (keyIsDown(57)) { // 9
        tool = 'escalator';
    } else if (keyIsDown(71)) { // G
        color = 'green';
    } else if (keyIsDown(79)) { // O
        color = 'orange';
    } else if (keyIsDown(80)) { // P
        color = 'purple';
    } else if (keyIsDown(89)) { // Y
        color = 'yellow';
    }

    updateUI();
}

/**
* Update UI elements (tools and colors selectors)
*/
function updateUI() {
    $('ul.tools').find('li.selected').removeClass('selected');
    $('ul.tools').find('li[data-tool="' + tool + '"]').addClass('selected');

    $('ul.colors').find('li.selected').removeClass('selected');
    $('ul.colors').find('li[data-color="' + color + '"]').addClass('selected');

    if (tool === 'gate' || tool === 'vortex' || tool === 'exit' || tool === 'article') {
        $('.colors').css('opacity', 1);
    } else {
        $('.colors').css('opacity', 0);
    }
}
