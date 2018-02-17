import config from './config';
import camera from './camera';
import Tile from './tile';
import heroes from './heroes';

export default {

    action: '',

    init() {
        /**
        * General key press actions
        * @param {Object} e event
        */
        document.addEventListener('keydown', (e) => {
            if (e.which === 67) { // C: engage tile setting
                this.pushNewTile();
            } else if (e.which === 82) { // R: rotate tile counterclockwise
                this.rotateNewTile(-1);
            } else if (e.which === 84) { // T: rotate tile clockwise
                this.rotateNewTile(1);
            } else if (e.which === 27) { // Esc: cancel current action
                this.cancel();
            }
        });

        document.addEventListener('mousedown', () => {
            this.click();
        });
    },

    click() {
        const cell = this.mouseCell();
        if (this.action === 'setting') {
            this.setTile(cell);
        } else {
            this.checkHero(cell);
        }
    },

    oldCell: {},

    /**
    * Get hovered cell coordinates
    * @return {Object} position {x: ,y: }
    */
    mouseCell() {
        const i = p5.floor((p5.mouseX - p5.width/2 - (camera.x * camera.zoomValue)) / (config.size * camera.zoomValue));
        const j = p5.floor((p5.mouseY - p5.height/2 - (camera.y * camera.zoomValue)) / (config.size * camera.zoomValue));

        const cell = {
            'x': i,
            'y': j
        }
        if (cell === this.oldCell) {
            return;
        } else {
            this.oldCell = cell;
            return cell;
        }
    },

    cancel() {
        if (this.action === 'setting') {
            tiles.pop();
        }
        this.action = '';
    },

    /**
    * Set tile being placed
    * @param {Object} cell cell to set tile onto
    */
    setTile(cell) {
        // Select tile being set
        const tile = tiles[tiles.length-1];
        const o = tile.getOrientation();

        if (tile.canBeSet && !tile.fixed) {
            this.action = '';

            if (o === 0) {
                tile.set(cell.x - 2, cell.y);
            } else if (o === 1) {
                tile.set(cell.x - 3, cell.y - 2);
            } else if (o === 2) {
                tile.set(cell.x - 1, cell.y - 3);
            } else if (o === 3) {
                tile.set(cell.x, cell.y - 1);
            }
        }
    },

    /**
    * Push new tile to tiles array
    */
    pushNewTile() {
        this.action = 'setting';

        // Select tile being set
        const tile = tiles[tiles.length-1];

        // Make sure last tile is fixed to prevent multiple tiles setting
        if (tile.fixed) {
            tiles.push(new Tile(1));
            // tiles.push(new Tile(tiles.length));
        }
    },

    /**
    * Rotate tile being set
    * @param  {int} dir direction (1 for clockwise, -1 for counterclockwise)
    */
    rotateNewTile(dir) {
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
    },

    checkHero(cell) {
        for (let i = 0; i < 4; i += 1) {
            const piece = heroes.pieces[i];
            if (piece.pos.x === cell.x && piece.pos.y === cell.y) {
                if (piece.status !== 'selected') {
                    piece.status = 'selected';
                } else {
                    piece.status = 'set';
                }
                console.log(heroes.pieces);
            }
        }
    }
}
