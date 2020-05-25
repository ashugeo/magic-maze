import ai from './ai';
import board from './board';
import camera from './camera';
import clock from './clock';
import config from './config';
import game from './game';
import Hero from './hero';
import helpers from './helpers';
import heroes from './heroes';
import player from './player';
import Tile from './tile';
import tiles from './tiles';
import ui from './ui';

export default {
    action: '', // '', 'placing', 'hero'
    mouseIn: false,
    crystal: null,
    keysDown: [],
    hoveredCell: {},
    hoveredTile: {},
    mouse: { x: 0, y: 0 },

    init() {
        /**
        * General key press actions
        * @param {Object} e event
        */
        document.addEventListener('keydown', e => {
            if (!this.keysDown.includes(e.which)) this.keysDown.push(e.which);

            if (e.which === 67) { // C: engage tile placing
                if (!game.isEnded()) this.newTile();
            } else if (e.which === 82) { // R: rotate tile counterclockwise
                if (!game.isEnded()) this.rotateTile(-1);
            } else if (e.which === 84) { // T: rotate tile clockwise
                if (!game.isEnded()) this.rotateTile(1);
            } else if (e.which === 27) { // Esc: cancel current action
                if (!game.isEnded()) this.cancel();
            } else if (e.which === 66) { // B
                // Steal
                // game.setPhase(2);
            } else if (e.which === 80) { // P
                if (game.isPaused()) game.resume();
                else game.pause();
            } else if (e.which === 71) { // G
                ui.toggleClass('grid', 'visible');
            }
        });

        document.addEventListener('keyup', e => {
            this.keysDown.splice(this.keysDown.indexOf(e.which), 1);
        });

        document.addEventListener('mousedown', () => {
            if (!game.isEnded() && this.mouseIn) this.mouseDown();
        });

        document.addEventListener('mouseup', () => {
            if (!game.isEnded() && this.mouseIn) this.mouseUp();
        });

        document.addEventListener('mouseover', e => {
            if (ui.hasClass(e.target, 'hitbox')) {
                const x = parseInt(e.target.getAttribute('data-x'));
                const y = parseInt(e.target.getAttribute('data-y'));

                this.hoveredTile = { x, y };
            }
        });

        document.addEventListener('mouseout', e => {
            if (ui.hasClass(e.target, 'hitbox')) {
                this.hoveredTile = {};
            }
        });

        document.addEventListener('mousemove', e => {
            if (!game.isEnded() && this.mouseIn) this.mouseMove(e);
        });

        document.getElementById('game-wrap').addEventListener('mouseleave', () => {
            this.mouseIn = false;
            camera.mouseIn = false;
        });

        document.getElementById('game-wrap').addEventListener('mouseenter', () => {
            this.mouseIn = true;
            camera.mouseIn = true;
        });

        window.oncontextmenu = () => {
            // Right click: rotate tile
            if (!game.isEnded()) this.rotateTile(1);
            return false;
        }
    },

    mouseDown() {
        // Spectator can't click
        if (player.role.length === 0) return;

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

    mouseUp() {
        const cell = this.getHoveredCell();
        const hero = this.hero;

        if (!hero) return;

        if (cell && !(cell.x === hero.cell.x && cell.y === hero.cell.y)) {
            if (this.action === 'hero' && hero.canGoTo(cell)) {
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

    getHoveredCell() {
        if (this.hoveredTile.x === null || this.hoveredTile.y === null || !this.hoveredTile.bcr) return null;
        let { x, y, bcr } = this.hoveredTile;

        const _x = (this.mouse.x - bcr.left) / camera.zoomValue;
        const _y = (this.mouse.y - bcr.top) / camera.zoomValue;

        if (_x > 91) x += 3;
        else if (_x > 64) x += 2;
        else if (_x > 37) x += 1;

        if (_y > 91) y += 3;
        else if (_y > 64) y += 2;
        else if (_y > 37) y += 1;

        return { x, y };
    },

    /**
    * Mouse movements events
    */
    mouseMove(e) {
        const oldCell = this.hoveredCell;

        if (e) this.mouse = {
            x: e.clientX,
            y: e.clientY
        };
        
        const el = document.elementFromPoint(this.mouse.x, this.mouse.y);
        if (el.nodeName === 'rect') this.hoveredTile.bcr = el.getBoundingClientRect();
        else this.hoveredTile.bcr = null;

        const cell = this.getHoveredCell();

        if (!cell) return;

        if (!oldCell || cell.x === oldCell.x && cell.y === oldCell.y) return;

        this.hoveredCell = cell;

        for (const hero of heroes.all) {
            if (hero.cell.x === cell.x && hero.cell.y === cell.y) hero.isHovered = true;
            else hero.isHovered = false; 
        }

        if (this.action === 'hero') {
            const hero = this.hero;
            // if (cell.x !== this.oldMouseCell.x || cell.y !== this.oldMouseCell.y) {
                this.oldMouseCell = cell;
                hero.checkPath(cell);
                hero.displayPath();
            // }
        }

        const pickedTile = tiles.getPickedTile();
        if (pickedTile) this.moveTile();
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
    * @param {Object} cell {x, y} of cell to set tile onto
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

            // Mark gate cell as explored
            let gateCell = tile.getEnter(cell.x, cell.y, board.get(cell.x, cell.y).tileCell.x);
            gateCell = board.get(gateCell.x, gateCell.y);
            gateCell.setExplored();

            // This tile was picked thanks to a crystal
            if (this.crystal) crystal.addOneUse();

            // Run AI
            ai.run();
        }
    },

    /**
    * Get next tile from stock
    */
    newTile() {
        if (!player.role.includes('explore') && !config.debug) return;
        if (tiles.getStockSize() === 0) return;
        let canAddTile = false;

        // Check for a hero standing on a gate the same color as his
        for (let hero of heroes.all) {
            const cell = board.get(hero.cell.x, hero.cell.y);
            if (cell.item && cell.item.color === hero.color && cell.item.type === 'gate' && !cell.isExplored()) {
                this.crystal = null;
                canAddTile = true;
                break;
            }
        }

        if (!canAddTile) {
            // Check for purple hero standing on a crystal
            for (let hero of heroes.all) {
                const cell = board.get(hero.cell.x, hero.cell.y);
                if (cell.item && cell.item.color === hero.color && cell.item.type === 'crystal' && !cell.isUsed()) {
                    this.crystal = cell;
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
                this.moveTile();
            }
        }
    },

    moveTile() {
        const pickedTile = tiles.getPickedTile();

        if (pickedTile) {
            // Hovered cell
            const cell = this.getHoveredCell();
            const o = pickedTile.getOrientation();
    
            // Place cursor on enter cell depending on orientation
            const origin = pickedTile.getOrigin(cell.x, cell.y, o);

            pickedTile.move(origin.x, origin.y);

            // Display tile
            // pickedTile.display();
        }
    },

    /**
    * Rotate picked tile
    * @param  {int} dir direction (1 for clockwise, -1 for counterclockwise)
    */
    rotateTile(dir) {
        const pickedTile = tiles.getPickedTile();
        if (pickedTile) {
            pickedTile.rotate(dir);
            this.moveTile();
        }
    },

    /**
    * Check if there's a selectable hero in this cell
    * @param  {Object}         cell cell to check
    * @return {Object|Boolean}
    */
    checkForHero(cell) {
        if (!cell) return false;
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
        hero.displayPath();
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
                player.allActions = helpers.shuffleArray(player.allActions);
            } else if (game.players >= 2 && game.scenario >= 3) {
                // Scenario 3 or greater: swap roles when clock is inverted
                socket.emit('swap');
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
            if (ai.checkForWin()) game.win();
        } else if (item.type === 'camera' && item.color === hero.color) {
            // Yellow hero steps on camera
            const cell = board.get(hero.cell.x, hero.cell.y);
            if (!cell.isUsed()) cell.setUsed();
        }
    },

    isKeyDown(key) {
        return this.keysDown.includes(key);
    }
}
