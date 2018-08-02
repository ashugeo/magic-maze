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
    }

    isEmpty() {
        return this.empty;
    }

    setUsed(x, y) {
        this.item.used = true;
    }

    isUsed(x, y) {
        return this.item.used;
    }

    setExplored(x, y) {
        this.item.explored = true;
    }

    isExplored(x, y) {
        return this.item.explored;
    }

    setStolen(x, y) {
        this.item.stolen = true;
    }

    isStolen(x, y) {
        return this.item.stolen;
    }
}
