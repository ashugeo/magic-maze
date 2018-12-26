import ai from './ai';
import board from './board';
import camera from './camera';
import clock from './clock';
import config from './config';
import game from './game';
import Hero from './hero';
import helpers from './helpers';
import heroes from './heroes';
import Tile from './tile';
import tiles from './tiles';

export default {

    action: '',
    mouseIn: false,

    init() {
        /**
        * General key press actions
        * @param {Object} e event
        */
        document.addEventListener('keydown', e => {
            if (e.which === 67) { // C: engage tile placing
                if (!game.isEnded()) this.newTile();
            } else if (e.which === 82) { // R: rotate tile counterclockwise
                if (!game.isEnded()) this.rotateTile(-1);
            } else if (e.which === 84) { // T: rotate tile clockwise
                if (!game.isEnded()) this.rotateTile(1);
            } else if (e.which === 27) { // Esc: cancel current action
                if (!game.isEnded()) this.cancel();
            } else if (e.which === 66) { // B
                // this.steal();
            }
        });

        document.addEventListener('mousedown', () => {
            if (!game.isEnded() && this.mouseIn) this.mouseDown();
        });

        document.addEventListener('mouseup', () => {
            if (!game.isEnded() && this.mouseIn) this.mouseUp();
        });

        document.addEventListener('mousemove', () => {
            if (!game.isEnded() && this.mouseIn) this.mouseMove();
        });

        document.getElementById('canvas-wrap').addEventListener('mouseleave', () => {
            this.mouseIn = false;
            camera.mouseIn = false;
        });

        document.getElementById('canvas-wrap').addEventListener('mouseenter', () => {
            this.mouseIn = true;
            camera.mouseIn = true;
        });

        window.oncontextmenu = () => {
            if (!game.isEnded()) this.rotateTile(1);
            return false;
        }
    },

    mouseDown() {
        // Spectator can't click
        if (role.length === 0) return;

        const cell = this.getHoveredCell();

        if (this.action === 'placing') {
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
            if (this.action === 'hero' && hero.canGoTo(cell)) {
                // FIXME: hero will sometimes go to a cell it shouldn't if spammed/timed correctly
                hero.set(cell.x, cell.y);
                socket.emit('hero', {
                    id: hero.id,
                    cell: cell
                });
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
        if (this.action === 'placing') {
            tiles.putBackInStock();
        }
        this.action = '';
    },

    /**
    * Set picked tile
    * @param {Object} cell cell to set tile onto
    */
    setTile(cell) {
        // Select picked tile
        const tile = tiles.getPickedTile();
        const o = tile.getOrientation();

        if (tile.canBeSet && tile.status === 'picked') {
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
            this.gateCell.setExplored();

            // Run AI
            ai.run();
        }
    },

    gateCell: {},

    /**
    * Get next tile from stock
    */
    newTile() {
        if (role.indexOf('explore') === -1) return;
        if (tiles.getStockSize() === 0) return;
        let canAddTile = false;

        for (let hero of heroes.all) {
            const cell = board.get(hero.cell.x, hero.cell.y);
            if (cell.item && cell.item.type === 'gate' && cell.item.color === hero.color) {
                this.gateCell = cell;
                if (!cell.isExplored()) {
                    canAddTile = true;
                    break;
                }
            }
        }


        if (canAddTile) {
            this.action = 'placing';

            // Make sure no tile is already picked
            if (!tiles.isPickedTile()) {
                tiles.getFromStock();
            }
        }
    },

    /**
    * Rotate picked tile
    * @param  {int} dir direction (1 for clockwise, -1 for counterclockwise)
    */
    rotateTile(dir) {
        const pickedTile = tiles.getPickedTile();
        if (pickedTile) pickedTile.rotate(dir);
    },

    /**
    * Check if there's a selectable hero in this cell
    * @param  {Object}         cell cell to check
    * @return {Object|Boolean}
    */
    checkForHero(cell) {
        for (let hero of heroes.all) {
            if (hero.cell.x === cell.x && hero.cell.y === cell.y && hero.selectable) return hero;
        }
        return false;
    },

    /**
    * Select or deselect hero
    * @param  {Object} hero hero to select
    */
    toggleHero(hero) {
        for (let h of heroes.all) {
            // Prevent selection of multiple heroes
            if (h.status === 'selected' && h.id !== hero.id) return;
        }

        // Prevent selection of exited hero
        if (hero.exited) return;

        if (hero.status === 'selected') {
            hero.status = 'set';
        } else {
            hero.status = 'selected';
            this.action = 'hero';
            this.hero = hero;
            hero.checkPath();
        }
    },

    checkForEvents(cell, hero) {
        const item = board.get(cell.x, cell.y).item;

        if (!item) return;

        if (item.type === 'time' && !item.used) {
            // Time cell, invert clock
            clock.invert();
            socket.emit('invertClock');

            if (game.players === 1 && ai.bots.length === 0) {
                // Admin is the only player, shuffle roles
                allActions = helpers.shuffleArray(allActions);
            }

            // Time cell is now used
            board.setUsed(cell.x, cell.y);
            socket.emit('used', {
                x: cell.x,
                y: cell.y
            });
        } else if (item.type === 'article' && item.color === hero.color) {
            // Same color article, check if heroes can steal
            let canSteal = true;

            for (let hero of heroes.all) {
                const cell = board.get(hero.cell.x, hero.cell.y);
                const item = cell.item;
                if (!item || item.type !== 'article' || item.color !== hero.color) canSteal = false;
            }

            // All heroes can steal, engage game phase 2
            if (canSteal) game.setPhase(2);

        } else if (item.type === 'exit' && game.isPhase(2) && (item.color === hero.color || game.scenario === 1)) {
            // Same color exit or scenario 1 (only has purple exit)
            hero.exit();
            if (ai.checkForWin()) {
                game.win();
            }
        }
    }
}
