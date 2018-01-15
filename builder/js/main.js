const size = 100;
const tolerance = 4;

const tools = ['wall', 'enter', 'bridge', 'vortex']
let tool = 'wall';
let color;

function setup() {
    createCanvas(windowWidth, windowHeight);
    tile = new Tile();
}

function draw() {
    background(255);
    translate(width/2 - size*2, height/2 - size*2);

    // Background grid
    grid();

    // Display tile
    tile.display();

}

function mousePressed() {
    const mC = mouseCell();

    if (mC) {
        const cell = tile.data[mC.y][mC.x];

        if (mC.wall) {
            // Add/remove wall
            cell[mC.wall] === 1 ? state = 0 : state = 1;
            cell[mC.wall] = state;

            // Add/remove same wall to neighbour cell
            if (mC.wall === 'topWall' && tile.data[mC.y-1]) {
                tile.data[mC.y-1][mC.x].bottomWall = state;
            } else if (mC.wall === 'rightWall' && tile.data[mC.y][mC.x+1]) {
                tile.data[mC.y][mC.x+1].leftWall = state;
            } else if (mC.wall === 'bottomWall' && tile.data[mC.y+1]) {
                tile.data[mC.y+1][mC.x].topWall = state;
            } else if (mC.wall === 'leftWall' && tile.data[mC.y][mC.x-1]) {
                tile.data[mC.y][mC.x-1].rightWall = state;
            }
        } else if (mC.item) {
            cell.item = mC.item;
        }
    }
}

class Tile {
    constructor(id) {
        this.x = 0;
        this.y = 0;
        this.data = {};
        for (let i = 0; i < 4; i += 1) {
            this.data[i] = {};

            for (let j = 0; j < 4; j += 1) {
                this.data[i][j] = {};

                const cell = this.data[i][j];

                // Build generic outer walls
                if (i === 0 && j !== 2) {
                    cell.topWall = 1;
                }
                if (j === 3 && i !== 2) {
                    cell.rightWall = 1;
                }
                if (i === 3 && j !== 1) {
                    cell.bottomWall = 1;
                }
                if (j === 0 && i !== 1) {
                    cell.leftWall = 1;
                }
            }
        }
    }

    display() {
        for (let i = 0; i < 4; i += 1) {
            for (let j = 0; j < 4; j += 1) {
                // For each cell
                const cell = this.data[i][j];

                push();
                translate(j*size, i*size);

                // Draw basic grid
                blendMode(MULTIPLY);
                stroke(240);
                strokeWeight(2);
                rect(0, 0, size, size);

                stroke(0);

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

                        if (i === 0) {
                            arrow(item.type);
                        } else if (i === 3) {
                            push();
                            rotate(PI);
                            translate(-size, -size);
                            arrow(item.type);
                            pop();
                        } else if (j === 0) {
                            push();
                            translate(0, size);
                            rotate(-PI/2);
                            arrow(item.type);
                            pop();
                        } else if (j === 3) {
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
                if (cell.topWall > 0) {
                    line(0, 0, size, 0);
                }
                if (cell.rightWall > 0) {
                    line(size, 0, size, size);
                }
                if (cell.bottomWall > 0) {
                    line(0, size, size, size);
                }
                if (cell.leftWall > 0) {
                    line(0, 0, 0, size);
                }

                pop();
            }
        } // end of cell
    }
}

/**
* Draw background grid
*/
function grid() {
    for (let i = 0; i < 4; i += 1) {
        for (let j = 0; j < 4; j += 1) {
            push();
            translate(i*size, j*size);

            // Draw cell
            stroke(240);
            rect(0, 0, size, size);

            pop();
        }
    }
}

/**
* General key press actions
* @param {Object} e event
*/
function keyPressed(e) {
    if (keyIsDown(49)) { // 1
        tool = 'wall';
    } else if (keyIsDown(50)) { // 2
        tool = 'enter';
    } else if (keyIsDown(51)) { // 3
        tool = 'bridge';
    } else if (keyIsDown(52)) { // 4
        tool = 'vortex';
    }

    // console.log(tool);
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
* Get hovered cell coordinates
* @return {Object} position {x: ,y: }
*/
function mouseCell() {
    const i = floor((mouseX - width/2) / size) + 2;
    const j = floor((mouseY - width/2) / size) + 2;

    if (i < 0 || i > 3 || j < 0 || j > 3) {
        return false;
    }

    const cX = (mouseX - width/2 + size*2) % size;
    const cY = (mouseY - width/2 + size*2) % size;

    let wall = false;
    let item = false;

    if (tool === 'wall') {
        // Detect closest wall
        if (cX < size / tolerance) {
            wall = 'leftWall';
        } else if (size - cX < size / tolerance) {
            wall = 'rightWall';
        }

        if (cY < size / tolerance) {
            wall = 'topWall';
        } else if (size - cY < size / tolerance) {
            wall = 'bottomWall';
        }
    } else {
        item = {
            'type': tool,
            'color': color
        }
    }

    const cell = {
        'x': i,
        'y': j,
        'wall': wall,
        'item': item
    }

    console.log(cell);
    console.log(tile.data);

    return cell;
}

$(document).on('click', 'ul li', (e) => {
    const $el = $(e.currentTarget);
    $el.parent().find('li.selected').removeClass('selected');
    $el.addClass('selected');

    if ($el.parent().hasClass('colors')) {
        // $('ul.tools li').attr('data-color', $el.attr('data-color'));
        color = $el.attr('data-color');
    } else if ($el.parent().hasClass('tools')) {
        tool = $el.attr('data-tool');
    }
});
