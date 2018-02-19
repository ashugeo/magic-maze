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
        this.move(cell)
    }

    /**
    * Get path from this hero to a cell
    * @param  {Object} target Target cell
    * @return {Object}        Path
    */
    getPath(target) {
        const piece = this.cell;
        const path = this.path = [];

        if (piece.x !== target.x && piece.y !== target.y) {
            // Not the same column or row
            const escalator = board[piece.x][piece.y].escalator;
            if (escalator.x === target.y && escalator.y === target.x) {
                path.push({'x': piece.x, 'y': piece.y})
                path.push({'x': target.x, 'y': target.y})
                return path;
            } else {
                return;
            }
        } else if (piece.x === target.x && piece.y === target.y) {
            // Same column and row = same cell
            path.push({'x': piece.x, 'y': piece.y})
            return path;
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
        const path = this.getPath(target);
        if (!path) return;
        console.log(path);

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

                if (!path[i-1].reachable) {
                    // Previous cell in path is unreachable, this one should be as well
                    path[i].reachable = false;
                    return;
                }

                const x = path[i - 1].x;
                const y = path[i - 1].y;
                const cell = board[x][y];

                // Compare cell to previous cell
                // TODO: check target wall as well
                if (path[i].x === x) {
                    if (path[i].y > y) {
                        // Going down
                        path[i].reachable = !cell.walls.bottom;
                    } else {
                        // Going up
                        path[i].reachable = !cell.walls.top;
                    }
                } else if (path[i].y === y) {
                    if (path[i].x > x) {
                        // Going right
                        path[i].reachable = !cell.walls.right;
                    } else {
                        // Going left
                        path[i].reachable = !cell.walls.left;
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
