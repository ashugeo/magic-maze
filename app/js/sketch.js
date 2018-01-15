import p5 from 'p5';
import config from './config';
import camera from './camera';
import board from './board';
import symbols from './symbols'
import events from './events'
// import Tile from './tile'

const sketch = (p5) => {
    window.p5 = p5;

    p5.setup = () => {
        p5.createCanvas(p5.windowWidth, p5.windowHeight);

        for (let i = 0; i < config.boardCols; i += 1) {
            board[i] = {};
            for (let j = 0; j < config.boardRows; j += 1) {
                board[i][j] = {};
            }
        }

        camera.pan(- config.boardCols / 2 * config.size, - config.boardRows / 2 * config.size);

        events.init();
    }

    p5.draw = () => {
        p5.clear();

        // Zoom with focus point at the center of screen
        p5.translate(p5.width/2, p5.height/2);
        camera.zoom();

        p5.push();
        camera.pan();

        if (config.debug) {
            symbols.grid();
        }

        // Display tiles
        displayTiles();

        p5.pop();
    }
}

/**
* Display all tiles
*/
function displayTiles() {
    for (let tile of tiles) {
        // Tiles is being placed, move it along cursor position
        if (!tile.fixed) {
            // Mouse cell
            const mC = events.mouseCell();
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

export default sketch;
