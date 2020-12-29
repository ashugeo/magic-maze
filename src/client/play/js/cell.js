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
            const _x = [-1, 1, -1, 1][data.tileCell.x];
            const _y = [-1, 1, -1, 1][data.tileCell.y];
            const cell = board.get(this.coord.x + _x, this.coord.y + _y);
            if (!cell || cell.isEmpty()) return;
            this.setExplored();
        }

        // If tile is set next to unexplored gate, it can be considered as explored
        const _x = [-1, 0, 0, 1][data.tileCell.x];
        const _y = [-1, 0, 0, 1][data.tileCell.y];
        const neighbor = board.get(this.coord.x + _x, this.coord.y + _y);
        if (!neighbor || neighbor.isEmpty()) return;
        if (neighbor.item && neighbor.item.type === 'gate' && !neighbor.isExplored()) {
            neighbor.setExplored();
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

    addOneUse() {
        if (this.item.uses) this.item.uses += 1;
        else this.item.uses = 1;

        // After two uses, set a crystal to used
        if (this.item.type === 'crystal' && this.item.uses === 2) {
            this.setUsed();
        }
    }
}
