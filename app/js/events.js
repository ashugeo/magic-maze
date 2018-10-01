import config from './config';
import board from './board';
import camera from './camera';
import Tile from './tile';
import pieces from './pieces'
import Hero from './hero';
import clock from './clock';
import game from './game';
import ai from './ai';

export default {

    action: '',

    init() {
        /**
        * General key press actions
        * @param {Object} e event
        */
        document.addEventListener('keydown', e => {
            if (e.which === 67) { // C: engage tile setting
                if (role.indexOf('explore') > -1) this.newTile();
            } else if (e.which === 82) { // R: rotate tile counterclockwise
                this.rotateTile(-1);
            } else if (e.which === 84) { // T: rotate tile clockwise
                this.rotateTile(1);
            } else if (e.which === 27) { // Esc: cancel current action
                this.cancel();
            } else if (e.which === 66) { // B: run bots
                ai.run();
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
            this.rotateTile(1);
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

        if (!(cell.x === this.oldHeroCell.x && cell.y === this.oldHeroCell.y)) {
            if (this.action === 'hero' && hero.canGo(cell)) {
                // FIXME: hero will sometimes go to a cell it shouldn't if spammed/timed correctly
                hero.set(cell);
                socket.emit('hero', {
                    id: hero.id,
                    cell: cell
                });
                this.checkForEvents(cell);
            } else {
                // Released hero (illegal move), tell admin to rerun AI
                socket.emit('ai');
            }
        } else {
            // Released hero (same cell), tell admin to rerun AI
            socket.emit('ai');
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
        const tile = tiles[tiles.length - 1];
        const o = tile.getOrientation();

        if (tile.canBeSet && !tile.fixed) {
            this.action = '';

            // Set tile at origin
            const origin = tile.getOrigin(cell.x, cell.y, o);
            tile.set(origin.x, origin.y);
            socket.emit('tile', {
                x: origin.x,
                y: origin.y,
                tile: tile
            });

            // Mark cell as explored
            this.bridgeCell.setExplored();

            // Run AI
            ai.run();
        }
    },

    bridgeCell: {},

    /**
    * Push new tile to tiles array
    */
    newTile() {
        let canAddTile = false;

        for (let piece of pieces.all) {
            const cell = board.get(piece.cell.x, piece.cell.y);
            if (cell.item && cell.item.type === 'bridge' && cell.item.color === piece.color) {
                this.bridgeCell = cell;
                if (!cell.isExplored()) {
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
    rotateTile(dir) {
        // Select tile being set
        const tile = tiles[tiles.length-1];

        // Make sure tile is not fixed
        if (!tile.fixed) {
            tile.rotate(dir);
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
                // TODO: make sure a piece can't be set underneath a selected piece that couldn't go elsewhere (and check purple exit end)
                if (!piece.selectable) return false;
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

    checkForEvents(cell, hero = this.hero) {
        const item = board.get(cell.x, cell.y).item;

        if (!item) return;

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

            // Article is now stolen
            board.get(cell.x, cell.y).setStolen();
        } else if (item.type === 'exit' && hero.hasStolen() && (item.color === hero.color || game.scenario === 1)) {
            // Same color exit or scenario 1 (only has purple exit)
            hero.exit();
            if (ai.checkForWin()) {
                // TODO: WIN
                console.log('game won!');
            }
        }
    }
}
