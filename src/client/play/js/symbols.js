import config from './config';
const size = config.size;

export default {
    /**
    * Draw background grid
    */
    grid() {
        // p5.textSize(8);
        // p5.fill(0, 0, 0, 128);
        // p5.stroke(0, 0, 0, 80);

        // for (let i = 0; i <= config.boardCols; i += 1) {
        //     // Draw vertical lines
        //     p5.strokeWeight(.5);
        //     p5.stroke(0, 0, 0, 80);
        //     p5.line(i * size, 0, i * size, config.boardRows * size);

        //     if (i !== config.boardCols) {
        //         for (let j = 0; j < config.boardRows; j += 1) {
        //             // Add coordinates as text
        //             p5.noStroke();
        //             p5.text(i + ':' + j, i * size + 6, j * size + 20);
        //         }
        //     }
        // }

        // for (let i = 0; i <= config.boardRows; i += 1) {
        //     // Draw horizontal lines
        //     p5.stroke(0, 0, 0, 80);
        //     p5.line(0, i * size, config.boardCols * size, i * size);
        // }

        p5.textSize(8);
        p5.fill(0, 0, 0, 128);
        p5.strokeWeight(.5);

        for (let i = 0; i <= (config.boardRows - 1) / 4; i += 1) {
            for (let j = 0; j <= (config.boardCols - 1) / 4; j += 1) {
                const x = i * size * 4 + 3.4 * size - size * 0.85 * j;
                const y = j * size * 4 - 3.4 * size + size * 0.85 * i;
                const s = size * 4
                
                for (let n = 0; n <= 4; n += 1) {
                    const x1 = x;
                    const y1 = y + n * size + [0, 5, 0, -5, 0][n];
                    const x2 = x + 4 * size;
                    const y2 = y + n * size + [0, 5, 0, -5, 0][n];
                    
                    // Draw horizontal lines
                    p5.stroke(0, 0, 255, 80);
                    p5.line(x1, y1, x2, y2);
                }

                for (let n = 0; n <= 4; n += 1) {
                    const x1 = x + n * size + [0, 5, 0, -5, 0][n];
                    const y1 = y;
                    const x2 = x + n * size + [0, 5, 0, -5, 0][n];
                    const y2 = y + 4 * size;
                    
                    // Draw vertical lines
                    p5.stroke(255, 0, 0, 80);            
                    p5.line(x1, y1, x2, y2);

                    // Add coordinates as text
                    if (n !== 4) for (let m = 0; m < 4; m += 1) {
                        p5.noStroke();
                        const text = `${i * 4 + n}:${j * 4 + m}`;
                        const x = x1 + 3 + [5, 0, 0, 5][n];
                        const y = y1 + 22 + m * size + [0, 0, -5, -7][m];
                        p5.text(text, x, y);
                    }
                }
            }
        }
    }
}
