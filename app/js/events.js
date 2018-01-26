import config from './config';
import camera from './camera';
import Tile from './tile'

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
            this.setTile();
        });
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
    },

    /**
    * Fix tile being set
    */
    setTile() {
        // Select tile being set
        const tile = tiles[tiles.length-1];
        const mC = this.mouseCell();
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
    }
}
