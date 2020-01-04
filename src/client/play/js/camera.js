import board from './board';
import config from './config';

export default {
    x: 0,
    y: 0,
    mouseIn: true,
    zoomValue: 4,
    targetZoom: 4,

    /**
    * Animate camera zoom
    */
    zoom() {
        if (p5.keyIsDown(65)) { // A: zoom out
            this.targetZoom -= .1;
        } else if (p5.keyIsDown(69)) { // E: zoom in
            this.targetZoom += .1;
        }

        // Bound to min and max zoom
        this.targetZoom = Math.min(Math.max(this.targetZoom, config.zoomMin), config.zoomMax);
        // Round to one decimal
        this.targetZoom = Math.round(this.targetZoom * 10) / 10;

        // Easing
        if (p5.abs(this.targetZoom - this.zoomValue) > .005) {
            this.zoomValue += (this.targetZoom - this.zoomValue) / config.zoomSpeed;
        } else {
            this.zoomValue = this.targetZoom;
        }

        p5.scale(this.zoomValue);
    },

    /**
    * Move camera around
    */
    move(x, y) {
        if (x && y) {
            this.x = x;
            this.y = y;
        }
        if (p5.keyIsDown(90)) { // Z: move up
            this.y -= config.cameraSpeed;
        }
        if (p5.keyIsDown(81)) { // Q: move left
            this.x -= config.cameraSpeed;
        }
        if (p5.keyIsDown(83)) { // S: move down
            this.y += config.cameraSpeed;
        }
        if (p5.keyIsDown(68)) { // D: move right
            this.x += config.cameraSpeed;
        }

        p5.translate(-this.x, -this.y);

        if (config.cameraMouse) {
            const x1 = -this.x
            const y1 = -this.y;
            const x2 = (-p5.width/2 + p5.mouseX) / this.zoomValue - this.x;
            const y2 = (-p5.height/2 + p5.mouseY) / this.zoomValue - this.y;

            const dist = Math.round(p5.dist(x1, y1, x2, y2) * this.zoomValue);
            const angle = Math.atan2(y2 - y1, x2 - x1);

            const distX = Math.round(Math.cos(angle) * dist);
            if (Math.abs(distX) > p5.width / 2 - 100) {
                this.x += Math.sign(distX) * config.cameraSpeed;
            }

            const distY = Math.round(Math.sin(angle) * dist);
            if (Math.abs(distY) > p5.height / 2 - 100) {
                this.y += Math.sign(distY) * config.cameraSpeed;
            }
        }
    },

    update() {
        if (!board.ready) return;

        const width = p5.width;
        const height = p5.height;

        const allCells = board.getAll();
        const allCellsReverse = [...allCells].reverse();
        
        const minX = allCells.find(col => Object.values(col).some(cell => !cell.empty))[0].coord.x;

        const maxX = allCellsReverse.find(col => Object.values(col).some(cell => !cell.empty))[0].coord.x;

        const minY = allCells.reduce((lowest, curr) => {
            const topMost = Object.values(curr).find(cell => !cell.empty);
            if (topMost) return Math.min(topMost.coord.y, lowest);
            return lowest;
        }, config.boardRows);

        const maxY = allCellsReverse.reduce((highest, curr) => {
            const bottomMost = Object.values(curr).reverse().find(cell => !cell.empty);
            if (bottomMost) return Math.max(bottomMost.coord.y, highest);
            return highest;
        }, 0);

        this.targetX = (minX + (maxX - minX + 1) / 2) * config.size;
        this.targetY = (minY + (maxY - minY + 1) / 2) * config.size;

        if (Math.abs(this.targetX - this.x) > 1) this.x += (this.targetX - this.x) / 50;
        if (Math.abs(this.targetY - this.y) > 1) this.y += (this.targetY - this.y) / 50;

        const tilesWidth = (maxX - minX) * config.size * this.targetZoom;
        const tilesHeight = (maxY - minY) * config.size * this.targetZoom;
        if (tilesWidth > width - 2 * config.size * this.targetZoom || tilesHeight > height - 2 * config.size * this.targetZoom) this.targetZoom -= .1;
    }
}
