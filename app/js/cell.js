import board from './board';

export default class Cell {
    constructor(x, y) {
        this.coord = {
            x: x,
            y: y
        };
        this.empty = true;
    }

    save(data) {
        this.empty = false;
        this.tileCell = data.tileCell;
        this.tileID = data.tileID;
        this.walls = data.walls;
        this.item = data.item ? data.item : false;
        this.escalator = data.escalator ? data.escalator : false;

        // If gate goes into set tile, it can be considered as explored
        if (data.item && data.item.type === 'gate') {
            const _x = [-1, 0, 0, 1][data.tileCell.x];
            const _y = [0, 1, -1, 0][data.tileCell.x];
            const cell = board.get(this.coord.x + _x, this.coord.y + _y);
            if (!cell) return;
            if (!cell.isEmpty()) this.setExplored();

            // gate goes into unexplored gate, set it as explored as well
            if (cell.item && cell.item.type === 'gate') {
                cell.setExplored();
            }
        }
    }

    isEmpty() {
        return this.empty;
    }

    setUsed() {
        this.item.used = true;
    }

    isUsed() {
        return this.item.used;
    }

    setExplored() {
        this.item.explored = true;
    }

    isExplored() {
        return this.item.explored;
    }

    setStolen() {
        this.item.stolen = true;
    }

    isStolen() {
        return this.item.stolen;
    }
}
