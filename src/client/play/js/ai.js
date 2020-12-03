import board from './board';
import Bot from './bot';
import clock from './clock';
import config from './config';
import game from './game';
import heroes from './heroes';
import tiles from './tiles';

export default {
    canSolve: true,
    pausedRun: false,
    bots: [],

    init(options) {
        if (!options.bots) return;
        for (let i = 0; i < Object.keys(options.bots).length; i += 1) {
            this.bots.push(new Bot(i, options.bots[Object.keys(options.bots)[i]].roles));
        }
    },

    setRoles(bots) {
        for (let i = 0; i < this.bots.length; i += 1) {
            this.bots[i].roles = bots[i].roles;
        }
    },

    run() {
        // Only run AI if game is not ended or paused
        if (game.isEnded() || game.isPaused()) return;

        // Only run AI if there are bots
        if (this.bots.length === 0) return;

        // Only the admin runs the AI
        if (!game.admin) return;

        // Prevent more than one call per second (let the bots time to think!)
        if (this.canSolve) {
            this.canSolve = false;
            setTimeout(() => {
                // Only run AI if game is not ended (check again after timeout)
                if (game.isEnded()) return;

                this.solve();
                this.canSolve = true;
                if (this.pausedRun) {
                    this.pausedRun = false;
                    this.run();
                }
            }, config.botsIntervalMin + Math.random() * (config.botsIntervalMax - config.botsIntervalMin));
        } else {
            this.pausedRun = true;
        }
    },

    solve() {
        let actions = [];

        // Find possible explorations
        actions = this.findExplorations(actions);

        // Find objectives
        const objectives = this.findObjectives();

        // Find possible moves for every hero
        actions = this.findHeroesMoves(actions, objectives);

        if (actions.length === 0) {
            actions = this.findHeroesMoves(actions, objectives, true);
        }

        this.playRandomAction(actions);
    },

    /**
    * Check for possible explorations (setting down a new tile)
    * @param {Array} actions array to add possible explorations to
    */
    findExplorations(actions) {
        for (let hero of heroes.all) {
            // Hero has already exited board
            if (hero.hasExited()) continue;

            const cell = board.get(hero.cell.x, hero.cell.y);
            const item = cell.item;
            if (!item) continue;

            // If hero sits on an unexplored gate with same color
            if (item.type === 'gate' && item.color === hero.color && !cell.isExplored()) {
                // Allow to set new tile
                actions.push({
                    role: 'explore',
                    cell: {
                        x: hero.cell.x,
                        y: hero.cell.y
                    },
                    cost: 0,
                    hero: hero
                });

                // Prevent two explorations at once
                return actions;
            }

            // If puple hero sits on an unused crystal
            if (item.type === 'crystal' && item.color === hero.color && !cell.isUsed()) {
                // Find an unexplored gate on board
                const gates = board.findItem('gate').filter(g => { return !g.isExplored(); });
                const targetCell = gates[Math.floor(Math.random() * gates.length)];

                if (targetCell) {
                    // Allow to set new tile
                    actions.push({
                        role: 'explore',
                        cell: {
                            x: targetCell.coord.x,
                            y: targetCell.coord.y
                        },
                        cost: 0,
                        crystal: cell
                    });

                    // Prevent two explorations at once
                    return actions;
                }
            }
        }

        // No possible exploration has been found
        return actions;
    },

    findObjectives() {
        let objectives = [];
        for (let j = 0; j < config.boardCols; j += 1) {
            for (let i = 0; i < config.boardRows; i += 1) {
                const cell = board.get(i, j);
                const item = cell.item;
                if (!item) continue;

                // Ignore empty cells
                if (cell.isEmpty()) continue;

                // Add time cells as objectives (when timer is below a fourth)
                if (
                    item.type === 'time' &&
                    !cell.isUsed() &&
                    clock.remaining < config.timer / 4
                ) {
                    objectives.push({
                        coord: {
                            x: cell.coord.x,
                            y: cell.coord.y
                        },
                        item: {
                            type: cell.item.type
                        }
                    });
                }

                if (item.type === 'camera' && !cell.isUsed()) {
                    objectives.push({
                        coord: {
                            x: cell.coord.x,
                            y: cell.coord.y
                        },
                        hero: heroes.findByColor(cell.item.color)
                    });
                }

                // Find unexplored gates (if stock is not empty, only during phase 1, and if some articles/exits remain unrevealed)
                if (
                    item.type === 'gate' &&
                    !cell.isExplored() &&
                    tiles.getStockSize() > 0 &&
                    game.isPhase(1) &&
                    (
                        board.count('article') < 4 ||
                        (
                            (game.isScenario(1) && board.count('exit') < 1) ||
                            (!game.isScenario(1) && board.count('exit') < 4)
                        )
                    )
                ) {
                    objectives.push({
                        coord: {
                            x: cell.coord.x,
                            y: cell.coord.y
                        },
                        hero: heroes.findByColor(cell.item.color)
                    });
                }

                // Find crystals (if stock is not empty, only during phase 1, and if some articles/exits remain unrevealed)
                if (
                    item.type === 'crystal' &&
                    !cell.isUsed() &&
                    tiles.getStockSize() > 0 &&
                    game.isPhase(1) &&
                    (
                        board.count('article') < 4 ||
                        (
                            (game.isScenario(1) && board.count('exit') < 1) ||
                            (!game.isScenario(1) && board.count('exit') < 4)
                        )
                    )
                ) {
                    objectives.push({
                        coord: {
                            x: cell.coord.x,
                            y: cell.coord.y
                        },
                        hero: heroes.findByColor(cell.item.color)
                    });
                }

                // Find articles (only during phase 1, and when all articles/exits are revealed)
                if (
                    item.type === 'article' &&
                    game.isPhase(1) &&
                    board.count('article') === 4 &&
                    (
                        (game.isScenario(1) && board.count('exit') === 1) ||
                        (!game.isScenario(1) && board.count('exit') === 4)
                    )
                ) {
                    objectives.push({
                        coord: {
                            x: cell.coord.x,
                            y: cell.coord.y
                        },
                        hero: heroes.findByColor(cell.item.color)
                    });
                }

                // Find exits (only during phase 2)
                if (item.type === 'exit' && game.isPhase(2)) {
                    objectives.push({
                        coord: {
                            x: cell.coord.x,
                            y: cell.coord.y
                        },
                        item: {
                            type: cell.item.type
                        },
                        hero: heroes.findByColor(cell.item.color)
                    });
                }
            }
        }

        return objectives;
    },

    /**
    * Pathfinder function
    * @param  {Object}         target {x: y:}
    * @param  {Object}         hero   hero object
    * @return {Object|Boolean}        path (or false if none)
    */
    findPath(objective, hero) {
        const start = hero.cell;
        let end;

        // Cells to be evaluated
        let open = this.getNeighbors(start, hero.color);

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

            let neighbors = this.getNeighbors(current, hero.color);
            for (let neighbor of neighbors) {
                // Make sure neighbor has not already been evaluated
                if (this.isInArray(neighbor, closed)) continue;

                // Compute new cost
                const newCost = this.getCost(neighbor, start, objective);

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
    * @return {Boolean}
    */
    isInArray(cell, array) {
        return array.some(a => { return (a.x === cell.x && a.y === cell.y)});
    },

    /**
    * Find accessible neighbors (no walls blocking the way)
    * @param  {Object} origin {x: y:}
    * @param  {Object} color  color of hero
    * @return {array}         neighbors
    */
    getNeighbors(origin, color) {
        let neighbors = [];
        origin = board.get(origin.x, origin.y);

        // Enable escalators
        if (origin.escalator) {
            // Make sure target doesn't hold a hero
            let canGo = true;
            for (let hero of heroes.all) {
                if (hero.cell.x === origin.escalator.x && hero.cell.y === origin.escalator.y) {
                    canGo = false;
                }
            }
            if (canGo) neighbors.push({
                x: origin.escalator.x,
                y: origin.escalator.y,
                escalator: origin.escalator
            });
        }

        // Enable vortexes
        if (origin.item && origin.item.type === 'vortex' && origin.item.color === color && game.isPhase(1)) {
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
                        // Make sure target doesn't hold a hero
                        let canGo = true;
                        for (let hero of heroes.all) {
                            if (hero.cell.x === cell.coord.x && hero.cell.y === cell.coord.y) {
                                canGo = false;
                            }
                        }
                        if (canGo) neighbors.push({
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

            // Make sure neighbor isn't empty
            if (!neighbor || neighbor.isEmpty()) continue;

            // Make sure no wall is blocking the way (or walls are orange, like hero)
            const wall1 = ['up', 'right', 'bottom', 'left'][i];
            const wall2 = ['bottom', 'left', 'up', 'right'][i];
            if ((!origin.walls[wall1] && !neighbor.walls[wall2]) || (origin.walls[wall1] === color && neighbor.walls[wall2] === color)) {
                neighbors.push({x: neighbor.coord.x, y: neighbor.coord.y});
            }
        }

        return neighbors;
    },

    /**
    * Compute cost for a cell
    * @param  {Object} cell   {x: y:}
    * @param  {Object} hero   {x: y:}
    * @param  {Object} target {x: y:}
    * @return {int}           cost
    */
    getCost(cell, hero, target) {
        // Distance between this cell and starting cell
        let distStart = Math.abs(hero.x - cell.x) + Math.abs(hero.y - cell.y);

        // Distance between this cell and target
        let distTarget = Math.abs(target.x - cell.x) + Math.abs(target.y - cell.y);

        return distStart + distTarget;
    },

    /**
    * Find possible moves for every hero
    * @param  {Array}  actions         actions
    * @param  {Array}  objectives      objectives cells
    * @param  {Boolan} [unblock=false] unblock hero or not
    * @return {Array}                  new actions
    */
    findHeroesMoves(actions, objectives, unblock = false) {
        // Find hero for each objective
        for (let objective of objectives) {
            // All heroes exit through the purple exit on scenario 1
            // All heroes can go on time cells
            if (objective.item && ((objective.item.type === 'exit' && game.isScenario(1)) || objective.item.type === 'time')) {
                for (let h of heroes.all) {
                    actions = this.findHeroMove(actions, objective, h, unblock);
                }
            } else {
                actions = this.findHeroMove(actions, objective, false, unblock);
            }
        }

        return actions;
    },

    /**
    * Find possible move for a given hero
    * @param  {Array}   actions   actions
    * @param  {Array}   objective objective cell
    * @param  {Object}  hero      given hero
    * @param  {Boolean} unblock   unblock hero or not
    * @return {Array}             new actions
    */
    findHeroMove(actions, objective, hero, unblock) {
        if (!hero) hero = objective.hero;

        // Hero has already exited board
        if (hero.hasExited()) return actions;

        // Find path
        const path = this.findPath(objective.coord, hero);
        if (!path) return actions;

        // Check for other heroes blocking the way
        for (let cell of path) {
            for (let h of heroes.all) {
                // Ignore self
                if (h.id === hero.id) continue;

                if (h.cell.x === cell.x && h.cell.y === cell.y) {
                    if (unblock) actions = this.unblockHero(objective, path, hero, h);
                    return actions;
                }
            }
        }

        // Find target
        const move = this.findMove(path);

        let canMove = true;

        // Prevent a hero from leaving an unexplored gate
        const cell = board.get(hero.cell.x, hero.cell.y);
        if (cell.item && cell.item.type === 'gate' && cell.item.color === hero.color && !cell.isExplored()) canMove = false;

        for (let i in actions) {
            if (actions[i].hero && actions[i].hero.id === hero.id) {
                // Prevent exploration + move from gate at once
                if (actions[i].role === 'explore' && actions[i].hero.id === hero.id) {
                    canMove = false;
                }

                // Prioritize lowest cost action for each hero
                if (actions[i].cost <= path.length) {
                    canMove = false;
                } else {
                    actions.splice(i, 1);
                }
            }
        }

        if (canMove) {
            actions.push({
                type: 'move',
                role: move.role,
                target: move.target,
                cost: path.length,
                hero: hero
            });
        }

        return actions;
    },

    /**
    * Unblock hero by moving blocking hero out of the way
    * @param  {Object} objective objective cell
    * @param  {Array}  path      path
    * @param  {Object} hero      moving hero
    * @param  {Object} h         blocking hero
    * @return {Object}           new actions
    */
    unblockHero(objective, path, hero, h) {
        // Already analyzed cells
        let closed = [];

        // Possible targets to move out of the way
        let targets = [];

        // Possible paths to move out of the way
        let paths = [];

        // Radius to look for empty cells within (capped for safety reasons)
        let delta = 0;

        while (paths.length === 0 && delta < 8) {
            delta += 1;
            for (let y = h.cell.y - delta; y <= h.cell.y + delta; y += 1) {
                for (let x = h.cell.x - delta; x <= h.cell.x + delta; x += 1) {
                    // Ignore previous candidate cells
                    if (this.isInArray({x, y}, closed)) continue;

                    // Save candidate cell
                    closed.push({x, y});

                    // Ignore self position
                    if (x === h.cell.x && y === h.cell.y) continue;

                    // Ignore cells in path
                    if (this.isInArray({x, y}, path)) continue;

                    // Ignore cells occupied by another hero
                    if (heroes.all.some(h => h.cell.x === x && h.cell.y === y)) continue;

                    const cell = board.get(x, y);
                    // Ignore empty cells
                    if (cell.isEmpty()) continue;
                    targets.push(cell);
                }
            }

            // Find path to objective
            for (let target of targets) {
                const path = this.findPath(target.coord, h);
                if (path) paths.push(path);
            }
        }

        // Shouldn't happend but let's prevent an error
        if (paths.length === 0) return [];

        // Find closest cell to get out of the way
        const shortestPath = paths.reduce((a, b) => { return a.length <= b.length ? a : b; });

        const objectives = [{
            coord: {
                x: shortestPath[shortestPath.length - 1].x,
                y: shortestPath[shortestPath.length - 1].y
            },
            hero: h
        }];

        // Rerun moves
        const actions = this.findHeroesMoves([], objectives);
        return actions;
    },

    playRandomAction(actions) {
        if (actions.length === 0) return;
        const id = Math.floor(Math.random() * actions.length);
        const action = actions[id];

        // Run bot with corresponding role
        for (const bot of this.bots) {
            if (bot.roles.includes(action.role)) {
                bot.play(action);
                return;
            } else {
                // TODO: turn this into a feature elsewhere (player tips) or remove it
                // if (action.hero) {
                //     console.log(action.role, action.hero.color, 'not allowed');
                // } else {
                //     console.log(action.role, 'not allowed');
                // }

                // Remove action from possible actions and rerun
                actions.splice(id, 1);
                this.playRandomAction(actions);
            }
        }
    },

    checkForWin() {
        for (const hero of heroes.all) {
            // Is every hero out?
            if (!hero.hasExited()) return false;
        }
        return true;
    }
}
