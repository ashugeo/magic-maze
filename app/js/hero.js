import config from './config';
import board from './board';
import pieces from './pieces'

export default class Hero {
    constructor() {
        this.id = Hero.incID(),
        this.color = config.heroes[this.id],
        this.cell = {
            x: 0,
            y: 0
        },
        this.status = '',
        this.path = []
    }

    static incID() {
        if (this.latestId === undefined) {
            this.latestId = 0;
        } else {
            this.latestId++;
        }
        return this.latestId;
    }

    move(cell) {
        this.pos = {
            x: this.pos.x + (this.cell.x - this.pos.x) / config.heroSpeed,
            y: this.pos.y + (this.cell.y - this.pos.y) / config.heroSpeed
        }
    }

    set(cell) {
        this.cell = {
            x: cell.x,
            y: cell.y
        };
        this.path = [];
        this.move(cell);
    }

    /**
    * Get path from this hero to a cell
    * @param  {Object} target Target cell
    * @return {Object}        Path
    */
    getPath(target) {
        const piece = this.cell;
        const path = this.path = [];

        if (piece.x === target.x && piece.y === target.y) {
            // Same column and row = same cell
            path.push({'x': piece.x, 'y': piece.y});
            return path;
        }

        // Check for vortex
        const item = board[piece.x][piece.y].item;
        if (item.type === 'vortex' && item.color === this.color) {
            const targetItem = board[target.x][target.y].item;
            if (targetItem && targetItem.type === 'vortex' && targetItem.color === this.color) {
                path.push({'x': piece.x, 'y': piece.y});
                path.push({'x': target.x, 'y': target.y, 'reachable': true});
                return path;
            }
        }

        if (piece.x !== target.x && piece.y !== target.y) {
            // Not the same column or row
            // Check for escalator
            const escalator = board[piece.x][piece.y].escalator;
            if (escalator.x === target.x && escalator.y === target.y) {
                path.push({'x': piece.x, 'y': piece.y});
                path.push({'x': target.x, 'y': target.y, 'reachable': true});
                return path;
            } else {
                return;
            }
        }

        if (piece.x < target.x) {
            for (let i = piece.x; i <= target.x; i += 1) {
                path.push({'x': i, 'y': piece.y})
            }
        } else if (piece.x > target.x) {
            for (let i = piece.x; i >= target.x; i -= 1) {
                path.push({'x': i, 'y': piece.y})
            }
        }

        if (piece.y < target.y) {
            for (let i = piece.y; i <= target.y; i += 1) {
                path.push({'x': piece.x, 'y': i})
            }
        } else if (piece.y > target.y) {
            for (let i = piece.y; i >= target.y; i -= 1) {
                path.push({'x': piece.x, 'y': i})
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

        const path = this.getPath(target);
        if (!path) return;

        for (let i in path) {
            path[i].reachable = true;

            if (Object.keys(board[path[i].x][path[i].y]).length === 0) {
                // Out of board
                path[i].reachable = false;
                return;
            }

            if (i > 0) {
                for (let piece of pieces.pieces) {
                    if (path[i].x === piece.cell.x && path[i].y === piece.cell.y) {
                        // Another piece blocking the way
                        path[i].reachable = false;
                        return;
                    }
                }

                if (path[i+1] && path[i+1].reachable) {
                    // Already marked as reachable (vortex and escalator)
                    path[i].reachable = true;
                    return;
                }

                if (!path[i-1].reachable) {
                    // Previous cell in path is unreachable, this one should be as well
                    path[i].reachable = false;
                    return;
                }

                // Check current cell and next cell walls depending on direction
                const x = path[i - 1].x;
                const y = path[i - 1].y;
                const cell = board[x][y];
                const next = board[path[i].x][path[i].y];
                if (path[i].x === x) {
                    if (path[i].y > y) {
                        // Going down
                        path[i].reachable = !cell.walls.bottom && !next.walls.top;
                    } else {
                        // Going up
                        path[i].reachable = !cell.walls.top && !next.walls.bottom;
                    }
                } else if (path[i].y === y) {
                    if (path[i].x > x) {
                        // Going right
                        path[i].reachable = !cell.walls.right && !next.walls.left;
                    } else {
                        // Going left
                        path[i].reachable = !cell.walls.left && !next.walls.right;
                    }
                }
            }
        }
    }

    /**
    * Check if hero can go to target cell
    * @param  {Object} target Target cell
    * @return {bool}
    */
    canGo(target) {
        const path = this.path;
        // No path
        if (path.length === 0) {
            return false;
        }

        // Get first unreachable cell in this path
        for (let i in path) {
            if (!path[i].reachable) {
                return false;
            }
        }

        return true;
    }
}
