import config from './config';
import board from './board';
import camera from './camera';
import Tile from './tile';
import pieces from './pieces'
import Hero from './hero';
import clock from './clock';
import game from './game';

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
            this.mouseDown();
        });

        document.addEventListener('mouseup', () => {
            this.mouseUp();
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

    mouseDown() {
        const cell = this.getHoveredCell();

        if (this.action === 'setting') {
            this.setTile(cell);
        }

        const isHero = this.checkForHero(cell);
        if (isHero) {
            this.toggleHero(isHero);
            this.oldHeroCell = cell;
        }
    },

    oldHeroCell: {},

    mouseUp() {
        const cell = this.getHoveredCell();
        const hero = this.hero;

        if (!hero) return;

        if (!(cell.x === this.oldHeroCell.x && cell.y === this.oldHeroCell.y) && this.action === 'hero') {
            if (hero.canGo(cell)) {
                // FIXME: hero will sometimes go to a cell it shouldn't if spammed/timed correctly
                hero.set(cell);
                socket.emit('hero', {
                    id: hero.id,
                    cell: cell
                });
                this.checkForEvents(cell);
            }
        }

        this.action = '';
        hero.path = [];
        this.toggleHero(hero);
        this.hero = false;
    },

    oldMouseCell: {},

    /**
    * Mouse movements events
    */
    mouseMove() {
        const cell = this.getHoveredCell();

        if (this.action === 'hero') {
            const hero = this.hero;
            if (cell.x !== this.oldMouseCell.x || cell.y !== this.oldMouseCell.y) {
                this.oldMouseCell = cell;
                hero.checkPath(cell);
            }
        }
    },

    /**
    * Get hovered cell coordinates
    * @return {Object} position {'x': ,'y': }
    */
    getHoveredCell() {
        const x = p5.floor((p5.mouseX - p5.width/2 - (camera.x * camera.zoomValue)) / (config.size * camera.zoomValue));
        const y = p5.floor((p5.mouseY - p5.height/2 - (camera.y * camera.zoomValue)) / (config.size * camera.zoomValue));

        const cell = {
            'x': x,
            'y': y
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

            this.bridgeCell.opened = true;
        }
    },

    bridgeCell: {},

    /**
    * Push new tile to tiles array
    */
    newTile() {
        let canAddTile = false;

        for (let piece of pieces.all) {
            const cell = board.getCell(piece.cell.x, piece.cell.y);
            if (cell.item && cell.item.type === 'bridge' && cell.item.color === piece.color) {
                this.bridgeCell = cell;
                if (!cell.opened) {
                    canAddTile = true;
                    break;
                }
            }
        }

        if (canAddTile) {
            this.action = 'setting';

            // Select tile being set
            const tile = tiles[tiles.length-1];

            // Make sure last tile is fixed to prevent multiple tiles setting
            if (tile.fixed) {
                // tiles.push(new Tile(1)); // TODO: remove this
                tiles.push(new Tile((tiles.length - 1) % (config.tiles - 1) + 1));
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
    checkForHero(cell) {
        for (let piece of pieces.all) {
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
        for (let piece of pieces.all) {
            // Prevent selection of multiple pieces
            if (piece.status === 'selected' && piece.id !== hero.id) return;
        }

        // Prevent selection of exited hero
        if (hero.exited) return;

        if (hero.status !== 'selected') {
            hero.status = 'selected';
            this.action = 'hero';
            this.hero = hero;
            hero.checkPath();
        } else {
            hero.status = 'set';
        }
    },

    checkForEvents(cell) {
        const hero = this.hero;
        const item = board.getCell(cell.x, cell.y).item;

        if (item.type === 'time' && !item.used) {
            // Time cell, invert clock
            clock.invert();
            socket.emit('invertClock');

            // Time cell is now used
            board.setUsed(cell.x, cell.y);
            socket.emit('used', {
                x: cell.x,
                y: cell.y
            });
        } else if (item.type === 'article' && item.color === hero.color) {
            // Same color article
            hero.steal();
        } else if (item.type === 'exit' && hero.hasStolen() && (item.color === hero.color || game.scenario === 1)) {
            // Same color exit or scenario 1 (only has purple exit)
            this.toggleHero(hero);
            hero.exit();
            game.checkForWin();
        }
    }
}
