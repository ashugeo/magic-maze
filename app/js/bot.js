import config from './config';
import board from './board';
import pieces from './pieces';
import Tile from './tile';

export default class Bot {
    constructor(id, roles) {
        this.id = id;
        this.roles = roles;
    }

    init() {
        this.solve();
        // TODO: bots should solve after a user action
        // this.interval = setInterval(() => { this.solve() }, config.botsInterval);
    }

    solve() {
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

                // Find exits
                // TODO
            }
        }

        for (let target of targets) {
            // Find piece for each target
            const piece = pieces.getPieceByColor(target.item.color);

            // Find path
            const path = this.findPath(target.coord, piece.cell);
            console.log(path);

            // TODO: move if possible
        }

        // Check for possible explorations
        for (let piece of pieces.all) {
            const cell = board.get(piece.cell.x, piece.cell.y);
            const item = cell.item;

            // If hero can explore
            if (this.roles.indexOf('explore') > -1) {
                // If hero sits on an unexplored bridge with same color
                if (cell.item && item.type === 'bridge' && item.color === piece.color && !cell.isExplored()) {
                    // Place new tile
                    this.newTile(piece.cell.x, piece.cell.y);
                }
            }
        }
    }

    /**
    * Pathfinder function
    * @param  {Object} target {x: y:}
    * @param  {Object} piece  {x: y:}
    * @return {Object/bool}   path (or false if none)
    */
    findPath(target, piece) {
        let end;

        // Set of nodes to be evaluated
        let open = this.getNeighbors(piece);

        // Set of nodes already evaluated
        let closed = [piece];

        // Compute cost of each neighbor
        for (let neighbor of open) {
            neighbor.parent = piece;
            neighbor.cost = this.getCost(neighbor, piece, target);
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

            let neighbors = this.getNeighbors(current);
            for (let neighbor of neighbors) {
                // Make sure neighbor has not already been evaluated
                if (this.isInArray(neighbor, closed)) continue;

                // Compute new cost
                let newCost = this.getCost(neighbor, piece, target);

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

        return path;
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
    * @param  {Object} cell  {x: y:}
    * @return {array}        neighbors
    */
    getNeighbors(cell) {
        let neighbors = [];
        cell = board.get(cell.x, cell.y);

        // TODO: enable vortex and elevators

        for (let i = 0; i < 4; i += 1) {
            // 0: up
            // 1: right
            // 2: bottom
            // 3: left
            const neighbor = board.get(
                cell.coord.x + [0, 1, 0, -1][i],
                cell.coord.y + [-1, 0, 1, 0][i]
            );

            // Make sure neighbor isn't empty
            if (neighbor.isEmpty()) continue;

            // Make sure no wall is blocking the way
            if (
                (i === 0 && !cell.walls.top && !neighbor.walls.bottom) ||
                (i === 1 && !cell.walls.right && !neighbor.walls.left) ||
                (i === 2 && !cell.walls.bottom && !neighbor.walls.top) ||
                (i === 3 && !cell.walls.left && !neighbor.walls.right)
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
    }
}
