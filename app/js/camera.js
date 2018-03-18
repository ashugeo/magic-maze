import config from './config';

export default {
    /**
    * Animate camera zoom
    */
    zoomValue: 2,
    targetZoom: 2,
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
    x: 0,
    y: 0,
    move(x, y) {
        if (x && y) {
            this.x = x;
            this.y = y;
        }
        if (p5.keyIsDown(90)) { // Z: move up
            this.y += config.cameraSpeed;
        }
        if (p5.keyIsDown(81)) { // Q: move left
            this.x += config.cameraSpeed;
        }
        if (p5.keyIsDown(83)) { // S: move down
            this.y -= config.cameraSpeed;
        }
        if (p5.keyIsDown(68)) { // D: move right
            this.x -= config.cameraSpeed;
        }

        p5.translate(this.x, this.y);
    }
}
