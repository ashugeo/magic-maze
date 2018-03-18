import config from './config';
import board from './board';
import camera from './camera';
import Tile from './tile';
import pieces from './pieces'
import Hero from './hero';

export default {

    action: '',

    init() {
        /**
        * General key press actions
        * @param {Object} e event
        */
        document.addEventListener('keydown', (e) => {
            if (e.which === 67) { // C: engage tile setting
                if (role.indexOf('explore') > -1) this.newTile();
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

        document.addEventListener('mousemove', () => {
            this.mouseMove();
        });

        document.getElementById('canvas-wrap').addEventListener('mouseleave', () => {
            camera.mouseIn = false;
        });

        document.getElementById('canvas-wrap').addEventListener('mouseenter', () => {
            camera.mouseIn = true;
        });

        window.oncontextmenu = () => {
            this.rotateNewTile(1);
            return false;
        }
    },

    click() {
        const cell = this.getHoveredCell();

        if (this.action === 'setting') {
            this.setTile(cell);
        } else if (this.action instanceof Hero) {
            const hero = this.action;
            if (hero.canGo(cell)) {
                hero.set(cell);
                this.action = '';
                socket.emit('hero', {
                    id: hero.id,
                    cell: cell
                });
            }
        }

        const hero = this.checkHero(cell)
        if (hero) {
            this.toggleHero(hero);
        }
    },

    oldCell: {},

    /**
    * Mouve movements events
    * @return {[type]} [description]
    */
    mouseMove() {
        const cell = this.getHoveredCell();

        if (this.action instanceof Hero) {
            const piece = this.action;
            if (cell.x !== this.oldCell.x || cell.y !== this.oldCell.y) {
                this.oldCell = cell;
                piece.checkPath(cell);
            }
        }
    },

    /**
    * Get hovered cell coordinates
    * @return {Object} position {'x': ,'y': }
    */
    getHoveredCell() {
        const i = p5.floor((p5.mouseX - p5.width/2 - (camera.x * camera.zoomValue)) / (config.size * camera.zoomValue));
        const j = p5.floor((p5.mouseY - p5.height/2 - (camera.y * camera.zoomValue)) / (config.size * camera.zoomValue));

        const cell = {
            'x': i,
            'y': j
        }

        return cell;
    },

    /**
    * Cancel current action
    */
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

            let _x = [-2, -3, -1, 0][o];
            let _y = [0, -2, -3, -1][o];

            let x = cell.x + _x;
            let y = cell.y + _y;

            tile.set(x, y);
            socket.emit('tile', {
                x: x,
                y: y,
                tile: tile
            });
        }
    },

    /**
    * Push new tile to tiles array
    */
    newTile() {
        let cannewTile = false;

        for (let piece of pieces.pieces) {
            const cell = board.getCell(piece.cell.x, piece.cell.y);
            if (cell.item && cell.item.type === 'bridge' && cell.item.color === piece.color) {
                if (!cell.opened) {
                    cell.opened = true;
                    cannewTile = true;
                    break;
                }
            }
        }

        if (cannewTile) {
            this.action = 'setting';

            // Select tile being set
            const tile = tiles[tiles.length-1];

            // Make sure last tile is fixed to prevent multiple tiles setting
            if (tile.fixed) {
                tiles.push(new Tile(1)); // TODO: remove this
                // tiles.push(new Tile(tiles.length));
            }
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

    /**
    * Check if there's a hero in this cell
    * @param  {Object} cell cell to check
    * @return {bool}
    */
    checkHero(cell) {
        for (let piece of pieces.pieces) {
            if (piece.cell.x === cell.x && piece.cell.y === cell.y) {
                return piece;
            }
        }
        return false;
    },

    /**
    * Select or deselect hero
    * @param  {Object} hero hero to select
    */
    toggleHero(hero) {
        for (let piece of pieces.pieces) {
            // Prevent selection of multiple pieces
            if (piece.status === 'selected' && piece.id !== hero.id) return;
        }

        if (hero.status !== 'selected') {
            hero.status = 'selected';
            this.action = hero;
            hero.checkPath();
        } else {
            hero.status = 'set';
        }
    }
}
