import config from './config';
import board from './board';
import pieces from './pieces';
import game from './game';
import Bot from './bot';

export default {
    canSolve: true,
    pausedRun: false,
    bots: [],

    init(options) {
        for (let i = 0; i < options.bots; i += 1) {
            this.bots.push(new Bot(i, options.botsRoles[i]));
        }
    },

    // TODO: solving comes too soon after player play (reset timeout?)
    run() {
        // Only the admin runs the bots
        if (!game.admin) return;

        // Prevent more than one call per second (let the bots time to think!)
        if (this.canSolve) {
            this.canSolve = false;
            this.solve();
            setTimeout(() => {
                this.canSolve = true;
                if (this.pausedRun) {
                    this.pausedRun = false;
                    this.run();
                }
            }, config.botsInterval);
        } else {
            this.pausedRun = true;
        }
    },

    solve() {
        console.log('Solving at', new Date().getSeconds());
        let actions = [];

        // Check for possible explorations
        for (let piece of pieces.all) {
            const cell = board.get(piece.cell.x, piece.cell.y);
            const item = cell.item;

            // If hero sits on an unexplored bridge with same color
            if (
                cell.item &&
                item.type === 'bridge' &&
                item.color === piece.color &&
                !cell.isExplored()
            ) {
                // Place new tile
                actions.push({
                    role: 'explore',
                    cell: {
                        x: piece.cell.x,
                        y: piece.cell.y
                    },
                    cost: 0
                });
            }
        }

        // Find objectives
        const objectives = this.findObjectives();

        // Find piece for each objective
        for (let objective of objectives) {
            let piece;
            if (objective.item.type === 'exit' && game.scenario === 1) {
                // All heroes exit through the purple exit
                for (let hero of pieces.all) {
                    if (hero.hasStolen()) piece = hero;
                }
            } else {
                piece = pieces.findPieceByColor(objective.item.color);
            }

            // Piece has already exited board
            if (piece.hasExited()) continue;

            // Find path
            const path = this.findPath(objective.coord, piece);
            if (!path) continue;

            // Find target
            const move = this.findMove(path);

            // Prioritize lowest cost action for each piece
            // TODO: disable two explorations at once
            // TODO: disable exploration + move from bridge at once
            let lower = false;

            for (let i in actions) {
                if (actions[i].piece && actions[i].piece.color === piece.color) {
                    if (actions[i].cost <= path.length) {
                        lower = true;
                    } else {
                        actions.splice(i, 1);
                    }
                }
            }

            if (!lower) {
                actions.push({type: 'move', role: move.role, target: move.target, cost: path.length, piece: piece});
            }
        }

        this.playRandomAction(actions);
    },

    findObjectives() {
        let objectives = [];
        for (let j = 0; j < config.boardCols; j += 1) {
            for (let i = 0; i < config.boardRows; i += 1) {
                const cell = board.get(i, j);
                const item = cell.item;

                // TODO: add time cells as objectives when remaining time is low

                // Ignore empty cells
                if (cell.isEmpty()) continue;

                // Find unexplored bridges
                if (item.type === 'bridge' && !cell.isExplored()) {
                    objectives.push(cell);
                }

                // Find articles to steal
                if (item.type === 'article' && !cell.isStolen()) {
                    objectives.push(cell);
                }

                // Find exits (if hero has stolen article)
                if (item.type === 'exit') {
                    for (let piece of pieces.all) {
                        if (piece.hasStolen()) objectives.push(cell);
                    }
                }
            }
        }

        return objectives;
    },

    /**
    * Pathfinder function
    * @param  {Object} target {x: y:}
    * @param  {Object} piece  {x: y:}
    * @return {Object/bool}   path (or false if none)
    */
    findPath(objective, piece) {
        // FIXME: illegal diagonal moves (because of multiple targets for one piece)
        // FIXME: bots play before they should when there are more than one :'(

        const start = piece.cell;
        let end;

        // Cells to be evaluated
        let open = this.getNeighbors(start, piece.color);

        // Cells already evaluated
        let closed = [start];

        // Compute cost of each neighbor
        for (let neighbor of open) {
            neighbor.parent = start;
            neighbor.cost = this.getCost(neighbor, start, objective);
        }

        while (open.length > 0) {
            // Find cell with lowest cost
            let current = open.reduce((min, o) => o.cost < min.cost ? o : min, open[0]);

            // Remove current from open, add to closed
            open = open.filter(n => { return !(n.x === current.x && n.y === current.y); });
            closed.push(current);

            // If current is the objective, path has been found
            if (current.x === objective.x && current.y === objective.y) {
                end = current;
                break;
            }

            let neighbors = this.getNeighbors(current, piece.color);
            for (let neighbor of neighbors) {
                // Make sure neighbor has not already been evaluated
                if (this.isInArray(neighbor, closed)) continue;

                // Compute new cost
                let newCost = this.getCost(neighbor, start, objective);

                // If new cost is lower, or neighbor hasn't been evaluated
                if (newCost < neighbor.cost || !this.isInArray(neighbor, open)) {
                    neighbor.cost = newCost;
                    neighbor.parent = current;
                    if (!this.isInArray(neighbor, open)) {
                        open.push(neighbor);
                    }
                }
            }
        }

        // No path found
        if (!end) return false;

        // Find parent for each cell in path
        let path = [];
        path.push(end);
        while (end.parent) {
            path.push(end.parent);
            end = end.parent;
        }

        // Revert path
        path = path.reverse();

        return path;
    },

    /**
    * Find furthest cell on a path in one move, and corresponding role
    * @param  {Object} path  path to objective
    * @return {Object}       {target, role: 'up'|'down'|'left'|'right'|'vortex'|'escalator'}
    */
    findMove(path) {
        let target;
        let role;

        for (let i = 0; i < path.length - 1; i += 1) {
            const current = path[i];
            const next = path[i + 1];
            let _role;

            if (current.x !== next.x && current.y !== next.y) {
                const cell = board.get(current.x, current.y);
                if (cell.escalator) {
                    _role = 'escalator';
                } else if (cell.item.type === 'vortex') {
                    _role = 'vortex';
                }
            } else {
                if (next.y > current.y) {
                    _role = 'down';
                } else if (next.y < current.y) {
                    _role = 'up';
                }

                if (next.x > current.x) {
                    _role = 'right';
                } else if (next.x < current.x) {
                    _role = 'left';
                }
            }

            if (role && _role !== role)  {
                target = current;
                break;
            } else if (i === path.length - 2) {
                role = _role;
                target = next;
                break;
            }

            role = _role;
        }

        return {target: target, role: role};
    },

    /**
    * Checks if cell is in array
    * @param  {Object}  cell  {x: y:}
    * @param  {array}   array array to check in
    * @return {bool}
    */
    isInArray(cell, array) {
        return array.some(a => { return (a.x === cell.x && a.y === cell.y)});
    },

    /**
    * Find accessible neighbors (no walls blocking the way)
    * @param  {Object} origin {x: y:}
    * @param  {Object} color  color of piece
    * @return {array}         neighbors
    */
    getNeighbors(origin, color) {
        let neighbors = [];
        origin = board.get(origin.x, origin.y);

        if (origin.escalator) {
            neighbors.push({
                x: origin.escalator.x,
                y: origin.escalator.y,
                escalator: origin.escalator
            });
        }

        // Enable vortex
        if (origin.item && origin.item.type === 'vortex' && origin.item.color === color) {
            // Search whole board for vortexes
            for (let j = 0; j < config.boardCols; j += 1) {
                for (let i = 0; i < config.boardRows; i += 1) {
                    const cell = board.get(i, j);
                    if (cell.isEmpty()) continue;

                    if (cell.item &&
                        cell.item.type === 'vortex' &&
                        cell.item.color === color &&
                        !(cell.coord.x === origin.coord.x && cell.coord.y === origin.coord.y)
                    ) {
                        neighbors.push({
                            x: cell.coord.x,
                            y: cell.coord.y,
                            item: {
                                type: 'vortex',
                                color: color
                            }
                        });
                    }
                }
            }
        }

        for (let i = 0; i < 4; i += 1) {
            // 0: up
            // 1: right
            // 2: bottom
            // 3: left
            const neighbor = board.get(
                origin.coord.x + [0, 1, 0, -1][i],
                origin.coord.y + [-1, 0, 1, 0][i]
            );

            if (!neighbor) continue;

            let canGo = true;

            // Make sure neighbor isn't empty
            if (neighbor.isEmpty()) canGo = false;

            // Make sure neighbor doesn't hold another piece
            // TODO: move a piece that's blocking another (good luck for this one)
            for (let piece of pieces.all) {
                if (piece.cell.x === neighbor.coord.x && piece.cell.y === neighbor.coord.y) {
                    canGo = false;
                }
            }

            if (!canGo) continue;

            // Make sure no wall is blocking the way
            if (
                (i === 0 &&
                    (!origin.walls.top && !neighbor.walls.bottom) ||
                    (origin.walls.top === 'orange' && neighbor.walls.bottom === 'orange' && color === 'orange')
                ) ||
                (i === 1 &&
                    (!origin.walls.right && !neighbor.walls.left) ||
                    (origin.walls.right === 'orange' && neighbor.walls.left === 'orange' && color === 'orange')
                ) ||
                (i === 2 &&
                    (!origin.walls.bottom && !neighbor.walls.top) ||
                    (origin.walls.bottom === 'orange' && neighbor.walls.top === 'orange' && color === 'orange')
                ) ||
                (i === 3 &&
                    (!origin.walls.left && !neighbor.walls.right) ||
                    (origin.walls.left === 'orange' && neighbor.walls.right === 'orange' && color === 'orange')
                )
            ) {
                neighbors.push({x: neighbor.coord.x, y: neighbor.coord.y});
            }
        }

        return neighbors;
    },

    /**
    * Compute cost for a cell
    * @param  {Object} cell   {x: y:}
    * @param  {Object} piece  {x: y:}
    * @param  {Object} target {x: y:}
    * @return {int}           cost
    */
    getCost(cell, piece, target) {
        // Distance between this cell and starting cell
        let distStart = Math.abs(piece.x - cell.x) + Math.abs(piece.y - cell.y);

        // Distance between this cell and target
        let distTarget = Math.abs(target.x - cell.x) + Math.abs(target.y - cell.y);

        return distStart + distTarget;
    },

    checkForWin() {
        for (let piece of pieces.all) {
            // Has every hero stolen their article?
            if (!piece.hasStolen()) return false;

            // Is every hero out?
            if (!piece.hasExited()) return false;
        }
        return true;
    },

    playRandomAction(actions) {
        if (actions.length === 0) return;
        const id = Math.floor(Math.random() * actions.length);
        const action = actions[id];

        // Run bot with corresponding role
        for (let bot of this.bots) {
            if (bot.roles.indexOf(action.role) > -1) {
                bot.play(action);
                return;
            } else {
                // TODO: turn this into a feature elsewhere (player tips) or remove it
                if (action.piece) {
                    // console.log(action.role, action.piece.color, 'not allowed');
                } else {
                    // console.log(action.role, 'not allowed');
                }
                // Remove action from possible actions and rerun
                actions.splice(id, 1);
                this.playRandomAction(actions);
            }
        }
    }
}
