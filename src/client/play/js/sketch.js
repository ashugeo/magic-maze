import p5 from 'p5/lib/p5.min.js';
import board from './board';
import camera from './camera';
import config from './config';
import events from './events';
import heroes from './heroes';
import symbols from './symbols';
import tiles from './tiles';

const sketch = p5 => {
    window.p5 = p5;
    window.tilesImages = [];

    p5.setup = () => {
        for (let i = 0; i < config.tiles; i +=1) {
            tilesImages.push(p5.loadImage('img/tile' + i + '.jpg'));
        }
        window.usedImage = p5.loadImage('img/used.png');

        const canvas = p5.createCanvas(p5.windowWidth - 300, p5.windowHeight);
        canvas.parent('canvas-wrap');

        p5.mouseX = p5.width/2;
        p5.mouseY = p5.height/2;
        camera.move(config.boardCols / 2 * config.size, config.boardRows / 2 * config.size);
    }

    p5.draw = () => {
        if (camera.autopan) camera.update();

        p5.clear();

        if (tiles.allTilesOnBoard()) {
            p5.background(174, 179, 184);
        }else {
            p5.background(245, 250, 255);
        }

        // Zoom with focus point at the center of screen
        p5.translate(p5.width/2, p5.height/2);
        camera.zoom();

        p5.push();
        camera.move();

        // Display tiles
        displayTiles();

        heroes.display();

        if (config.grid) {
            symbols.grid();
        }

        p5.pop();
    }
}

/**
* Display all tiles
*/
function displayTiles() {
    for (let tile of tiles.all) {
        // Don't display stock tiles
        if (tile.status === 'stock' || tile.status === 'picked') continue;

        // Display tile
        tile.display();
    }

    // Picked tile overlaps board so its display has to be called after
    for (let tile of tiles.all) {
        // Tiles is being placed, move it along cursor position
        if (tile.status === 'picked') {
            // Hovered cell
            const cell = events.getHoveredCell();
            const o = tile.getOrientation();

            // Place cursor on enter cell depending on orientation
            const origin = tile.getOrigin(cell.x, cell.y, o);
            tile.move(origin.x, origin.y);
            // Display tile
            tile.display();
        }
    }
}

export default sketch;
