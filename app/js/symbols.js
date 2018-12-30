import config from './config';
const size = config.size;

export default {
    /**
    * Draw background grid
    */
    grid() {
        p5.textSize(8);
        p5.fill(0, 0, 0, 128);
        for (let i = 0; i <= config.boardCols; i += 1) {
            // Draw vertical lines
            p5.strokeWeight(.5);
            p5.stroke(255, 0, 0, 80);
            p5.line(i * size, 0, i * size, config.boardRows * size);

            if (i !== config.boardCols) {
                for (let j = 0; j < config.boardRows; j += 1) {
                    // Add coordinates as text
                    p5.noStroke();
                    p5.text(i + ':' + j, i * size + 6, j * size + 20);
                }
            }
        }

        for (let i = 0; i <= config.boardRows; i += 1) {
            // Draw horizontal lines
            p5.stroke(0, 0, 255, 80);
            p5.line(0, i * size, config.boardCols * size, i * size);
        }
    }
}
