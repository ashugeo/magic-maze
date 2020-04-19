import ai from './ai';
import board from './board';
import config from './config';
import events from './events';
import game from './game';
import heroes from './heroes';
import player from './player';
import tiles from './tiles';

export default class Hero {
    constructor(id) {
        this.id = id,
        this.color = config.heroes[id],
        this.cell = {
            x: 0,
            y: 0
        },
        this.status = 'set', // set, selected, exited
        this.selectable = true,
        this.path = [];
        this.opacity = 255;
    }

    /**
    * Move hero to cell
    * @param {Object} cell cell X and Y coordinates
    */
    move(force = false) {
        if (force) {
            this.pos = {x: this.target.x, y: this.target.y};
            this.selectable = true;

            // Check for events on this cell
            events.checkForEvents(this.cell, this);

            // Run AI again
            ai.run();
        } else {
            let deltaX = this.target.x - this.pos.x;
            let deltaY = this.target.y - this.pos.y;
            let delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            let x = this.pos.x + deltaX / delta / config.heroSpeed;
            let y = this.pos.y + deltaY / delta / config.heroSpeed;
            this.pos = {x, y};
            this.selectable = false;
        }
    }

    /**
    * Set hero on cell
    * @param {int} x cell X coordinate
    * @param {int} y cell Y coordinate
    */
    set(x, y) {
        this.cell = {
            x: x,
            y: y
        };


        const boardCell = board.get(x, y);
        const tile = tiles.getTile(boardCell.tileID);
        const tileCell = boardCell.tileCell;

        if (tile) {
            x += [.25, .1, -.1, -.25][tileCell.x] + tile.shift.x / config.size;
            y += [.25, .1, -.1, -.25][tileCell.y] + tile.shift.y / config.size;
        }

        this.target = {
            x: x,
            y: y
        }

        this.path = [];
    }

    /**
    * Get path from this hero to a cell
    * @param  {Object} target Target cell
    * @return {Object}        Path
    */
    getPath(target) {
        const hero = this.cell;
        const path = this.path = [];

        if (hero.x === target.x && hero.y === target.y) {
            // Same column and row = same cell
            path.push({x: hero.x, y: hero.y});
            return path;
        }

        const role = config.debug ? ['up', 'right', 'down', 'left', 'explore', 'escalator', 'vortex'] : player.role;

        // Check for vortex
        if (role.includes('vortex')) {
            const item = board.get(hero.x, hero.y).item;
            if (item && item.type === 'vortex' && item.color === this.color) {
                const targetItem = board.get(target.x, target.y).item;
                if (targetItem && targetItem.type === 'vortex' && targetItem.color === this.color) {
                    path.push({x: hero.x, y: hero.y});
                    path.push({x: target.x, y: target.y, reachable: game.isPhase(1)});
                    return path;
                }
            }
        }

        if (hero.x !== target.x && hero.y !== target.y) {
            // Not the same column or row
            // Check for escalator
            if (role.includes('escalator')) {
                const escalator = board.get(hero.x, hero.y).escalator;
                if (escalator && escalator.x === target.x && escalator.y === target.y) {
                    path.push({x: hero.x, y: hero.y});
                    path.push({x: target.x, y: target.y, reachable: true});
                    return path;
                }
            }

            return;
        }

        if (hero.x < target.x) {
            for (let i = hero.x; i <= target.x; i += 1) {
                path.push({x: i, y: hero.y})
            }
        } else if (hero.x > target.x) {
            for (let i = hero.x; i >= target.x; i -= 1) {
                path.push({x: i, y: hero.y})
            }
        }

        if (hero.y < target.y) {
            for (let i = hero.y; i <= target.y; i += 1) {
                path.push({x: hero.x, y: i})
            }
        } else if (hero.y > target.y) {
            for (let i = hero.y; i >= target.y; i -= 1) {
                path.push({x: hero.x, y: i})
            }
        }
        return path;
    }

    /**
    * Check path legality
    * @param  {Object} target Target cell
    */
    checkPath(target) {
        // No specified target, check for self position (current cell)
        if (!target) target = this.cell;

        // Use player role
        const role = config.debug ? ['up', 'right', 'down', 'left', 'explore', 'escalator', 'vortex'] : player.role;

        const path = this.getPath(target);
        if (!path) return;

        for (let i in path) {
            i = parseInt(i);
            if (path[i].reachable === undefined) path[i].reachable = true;

            // Out of set tiles (empty cell)
            if (board.get(path[i].x, path[i].y).isEmpty()) {
                path[i].reachable = false;
                return;
            }

            // Already marked as reachable (vortex and escalator)
            if (path[i + 1] && path[i + 1].reachable) {

                // Make sure there is no other hero on target
                for (let hero of heroes.all) {
                    if (path[i + 1].x === hero.cell.x && path[i + 1].y === hero.cell.y) {
                        // Another hero blocking the way
                        path[i + 1].reachable = false;
                        return;
                    }
                }

                path[i].reachable = true;
                return;
            }

            if (i > 0) {
                for (let hero of heroes.all) {
                    if (path[i].x === hero.cell.x && path[i].y === hero.cell.y) {
                        // Another hero blocking the way
                        path[i].reachable = false;
                        return;
                    }
                }

                if (!path[i - 1].reachable) {
                    // Previous cell in path is unreachable, this one should be as well
                    path[i].reachable = false;
                    return;
                }

                // Check current cell and next cell walls depending on direction
                const x = path[i - 1].x;
                const y = path[i - 1].y;
                const cell = board.get(x, y);
                const next = board.get(path[i].x, path[i].y);
                if (path[i].x === x) {
                    if (path[i].y > y) {
                        // Going down
                        path[i].reachable = !cell.walls.bottom && !next.walls.top;
                        if (this.color === 'orange' && cell.walls.bottom === 'orange' && next.walls.top === 'orange') path[i].reachable = true;
                        if (!role.includes('down')) path[i].reachable = false;
                    } else {
                        // Going up
                        path[i].reachable = !cell.walls.top && !next.walls.bottom;
                        if (this.color === 'orange' && cell.walls.top === 'orange' && next.walls.bottom === 'orange') path[i].reachable = true;
                        if (!role.includes('up')) path[i].reachable = false;
                    }
                } else if (path[i].y === y) {
                    if (path[i].x > x) {
                        // Going right
                        path[i].reachable = !cell.walls.right && !next.walls.left;
                        if (this.color === 'orange' && cell.walls.right === 'orange' && next.walls.left === 'orange') path[i].reachable = true;
                        if (!role.includes('right')) path[i].reachable = false;
                    } else {
                        // Going left
                        path[i].reachable = !cell.walls.left && !next.walls.right;
                        if (this.color === 'orange' && cell.walls.left === 'orange' && next.walls.right === 'orange') path[i].reachable = true;
                        if (!role.includes('left')) path[i].reachable = false;
                    }
                }

                // Can't go to time cells when two or more cameras are active
                if (next.item && next.item.type === 'time') {
                    const cameras = board.findItem('camera').filter(c => { return !c.isUsed() });
                    if (cameras.length >= 2) path[i].reachable = false;
                }
            }
        }
    }

    /**
    * Check if hero can go to target cell
    * @param  {Object}  target Target cell
    * @return {Boolean}
    */
    canGoTo(target) {
        const path = this.path;

        // No path, no go
        if (path.length === 0) return false;

        // Make sure last cell in path is the target (anti-spam security)
        const last = path[path.length - 1];
        if (last.x !== target.x || last.y !== target.y) return false;

        // Get first unreachable cell in this path
        for (let i in path) {
            if (!path[i].reachable) {
                return false;
            }
        }

        return true;
    }

    exit() {
        this.status = 'exited';

        // Find exit cell (out of of board)
        const boardCell = board.get(this.cell.x, this.cell.y);
        const tileCell = boardCell.tileCell;
        const tileID = boardCell.tileID;
        const tile = tiles.getTile(tileID);
        const exit = tile.getExitPlusOne(tileCell.x, tileCell.y);

        // Move out of board
        const x = this.cell.x + exit.x;
        const y = this.cell.y + exit.y;
        this.set(x, y);

        // Run AI again
        ai.run();
    }

    hasExited() {
        return this.status === 'exited';
    }
}
