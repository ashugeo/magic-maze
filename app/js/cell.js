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
