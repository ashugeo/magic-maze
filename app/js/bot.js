import config from './config';
import board from './board';
import pieces from './pieces';
import Tile from './tile';
import game from './game';

export default class Bot {
    constructor(id, roles) {
        console.log(roles);
        this.id = id;
        this.roles = roles;
        this.actions = [];
        this.canAct = true;
    }

    solve() {
        console.clear();
        console.log('solve');
        // Check for possible explorations
        for (let piece of pieces.all) {
            const cell = board.get(piece.cell.x, piece.cell.y);
            const item = cell.item;

            // If hero can explore
            if (this.roles.indexOf('explore') > -1) {
                // If hero sits on an unexplored bridge with same color
                if (cell.item && item.type === 'bridge' && item.color === piece.color && !cell.isExplored()) {
                    // Place new tile
                    this.actions.push({
                        type: 'tile',
                        cell: {
                            x: piece.cell.x,
                            y: piece.cell.y
                        }
                    });
                }
            }
        }

        // TODO: prioritize closest target for each piece
        // TODO: blocked bridges (goes into wall) are not targets
        // TODO: unexplored bridges with a tile ahead should count as explored
        // TODO: move a piece that's blocking another (good luck for this one)

        // Find targets
        let targets = [];
        for (let j = 0; j < config.boardCols; j += 1) {
            for (let i = 0; i < config.boardRows; i += 1) {
                const cell = board.get(i, j);
                const item = cell.item;

                // Ignore empty cells
                if (cell.isEmpty()) continue;

                // Find unexplored bridges
                if (item.type === 'bridge' && !cell.isExplored()) {
                    targets.push(cell);
                }

                // Find articles to steal
                if (item.type === 'article' && !cell.isStolen()) {
                    targets.push(cell);
                }

                // Find exits (if hero has stolen article)
                if (item.type === 'exit') {
                    for (let piece of pieces.all) {
                        if (piece.hasStolen()) targets.push(cell);
                    }
                }
            }
        }

        console.log('targets:', targets);

        for (let target of targets) {
            // Find piece for each target
            const piece = pieces.getPieceByColor(target.item.color);

            console.log('piece.color:', piece.color);

            // Find path
            const path = this.findPath(target.coord, piece);
            if (path) this.processPath(piece, path);
        }


        // console.log(JSON.stringify(this.actions, null, 4));
        this.act();
    }

    act() {
        console.log('act', new Date().getSeconds());
        if (this.actions.length > 0) {
            if (!this.canAct) return;
            this.canAct = false;
            const action = this.actions[0];

            if (action.type === 'tile') {
                this.newTile(action.cell.x, action.cell.y);
                this.actions.shift();
            } else if (action.type === 'move') {
                if (action.piece.status === 'set' && action.piece.selectable) {
                    action.piece.set(action.target);
                    this.actions.shift();
                }
            }

            setTimeout(() => {
                this.canAct = true;
                this.act();
            }, config.botsInterval);
        }
    }

    /**
    * Pathfinder function
    * @param  {Object} target {x: y:}
    * @param  {Object} piece  {x: y:}
    * @return {Object/bool}   path (or false if none)
    */
    findPath(target, piece) {
        console.log('findPath');
        // FIXME: illegal diagonal moves
        // FIXME: bots before they should when there are more than one :'(

        const start = piece.cell;
        let end;

        console.log('start:', start);

        // Set of nodes to be evaluated
        let open = this.getNeighbors(start, piece.color);

        // Set of nodes already evaluated
        let closed = [start];

        // Compute cost of each neighbor
        for (let neighbor of open) {
            neighbor.parent = start;
            neighbor.cost = this.getCost(neighbor, start, target);
        }

        while (open.length > 0) {
            // Find cell with lowest cost
            let current = open.reduce((min, o) => o.cost < min.cost ? o : min, open[0]);

            // Remove current from open, add to closed
            open = open.filter(n => { return !(n.x === current.x && n.y === current.y); });
            closed.push(current);

            // If current is the target, path has been found
            if (current.x === target.x && current.y === target.y) {
                end = current;
                break;
            }

            let neighbors = this.getNeighbors(current, piece.color);
            for (let neighbor of neighbors) {
                // Make sure neighbor has not already been evaluated
                if (this.isInArray(neighbor, closed)) continue;

                // Compute new cost
                let newCost = this.getCost(neighbor, start, target);

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
            path.push(end.parent)
            end = end.parent;
        }

        // Revert path
        path = path.reverse();

        console.log(path);
        return path;
    }

    /**
    * Move given piece to the furthest cell on a path depending on roles
    * @param  {Object} piece piece to move
    * @param  {Object} path  path to target
    */
    processPath(piece, path) {
        let target;
        let direction;

        for (let i = 0; i < path.length - 1; i += 1) {
            const current = path[i];
            const next = path[i + 1];
            let _dir;

            if (current.x !== next.x && current.y !== next.y) {
                // Vortex or escalator
            } else {
                if (next.y > current.y) {
                    _dir = 'down';
                } else if (next.y < current.y) {
                    _dir = 'up';
                }

                if (next.x > current.x) {
                    _dir = 'right';
                } else if (next.x < current.x) {
                    _dir = 'left';
                }
            }


            if (direction && _dir !== direction)  {
                target = current;
                break;
            } else if (i === path.length - 2) {
                direction = _dir;
                target = next;
                break;
            }

            direction = _dir;
        }

        if (this.roles.indexOf(direction) > -1) {
            this.actions.push({
                type: 'move',
                piece: piece,
                target: target
            });
        }
    }

    /**
    * Checks if cell is in array
    * @param  {Object}  cell  {x: y:}
    * @param  {array}   array array to check in
    * @return {bool}
    */
    isInArray(cell, array) {
        return array.some(a => { return (a.x === cell.x && a.y === cell.y)});
    }

    /**
    * Find accessible neighbors (no walls blocking the way)
    * @param  {Object} origin {x: y:}
    * @param  {Object} color  color of piece
    * @return {array}         neighbors
    */
    getNeighbors(origin, color) {
        console.log('getNeighbors');
        let neighbors = [];
        origin = board.get(origin.x, origin.y);

        if (origin.escalator) {
            neighbors.push({x: origin.escalator.x, y: origin.escalator.y, escalator: origin.escalator});
        }

        // console.log('origin:', origin);

        if (origin.item && origin.item.type === 'vortex') {
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

        // TODO: enable elevators

        for (let i = 0; i < 4; i += 1) {
            // 0: up
            // 1: right
            // 2: bottom
            // 3: left
            const neighbor = board.get(
                origin.coord.x + [0, 1, 0, -1][i],
                origin.coord.y + [-1, 0, 1, 0][i]
            );

            let canGo = true;

            // Make sure neighbor isn't empty
            if (neighbor.isEmpty()) canGo = false;

            // Make sure neighbor doesn't hold another piece
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
                    (origin.walls.top === 'orange' && neighbor.walls.bottom === 'orange')
                ) ||
                (i === 1 &&
                    (!origin.walls.right && !neighbor.walls.left) ||
                    (origin.walls.right === 'orange' && neighbor.walls.left === 'orange')
                ) ||
                (i === 2 &&
                    (!origin.walls.bottom && !neighbor.walls.top) ||
                    (origin.walls.bottom === 'orange' && neighbor.walls.top === 'orange')
                ) ||
                (i === 3 &&
                    (!origin.walls.left && !neighbor.walls.right) ||
                    (origin.walls.left === 'orange' && neighbor.walls.right === 'orange')
                )
            ) {
                neighbors.push({x: neighbor.coord.x, y: neighbor.coord.y});
            }
        }
        return neighbors;
    }

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

        // Distance between this cell and target cell
        let distTarget = Math.abs(target.x - cell.x) + Math.abs(target.y - cell.y);

        return distStart + distTarget;
    }

    /**
    * Create and set a new tile
    * @param  {int} x bridge X coordinate
    * @param  {int} y bridge Y coordinate
    */
    newTile(x, y) {
        // Create and save new tile
        const tile = new Tile((tiles.length - 1) % (config.tiles - 1) + 1);
        tiles.push(tile);

        // Get cell and enter coordinates
        const cell = board.get(x, y);
        const enter = tile.getEnter(x, y, cell.tileCell.x);

        if (!board.get(enter.x, enter.y).isEmpty()) {
            // Already a tile there, cancel
            tiles.pop();
            return;
        }


        // Compute new orientation relative to bridge X coordinate
        let o = tile.getOrientation();
        let _o = [1, 0, 2, 3][cell.tileCell.x];

        // Rotate tile by difference
        tile.rotate(_o - o);

        // Set tile at origin
        const origin = tile.getOrigin(enter.x, enter.y, _o);

        tile.set(origin.x, origin.y);
        socket.emit('tile', {
            x: origin.x,
            y: origin.y,
            tile: tile
        });

        // Mark bridge as explored
        cell.setExplored(x, y);

        // Run again
        // game.runBots();
    }
}
