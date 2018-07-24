import config from './config';
import board from './board';
import Hero from './hero';

export default {

    pieces: [],

    init() {
        for (let i = 0; i < 4; i += 1) {
            this.pieces.push(new Hero(i));
            this.pieces[i].set({
                x: config.firstTile.x + [1, 2, 2, 1][i],
                y: config.firstTile.y + [1, 1, 2, 2][i]
            });
            this.pieces[i].pos = this.pieces[i].target;
            this.pieces[i].status = 'set';
        }
    },

    display() {
        p5.noStroke();
        for (let piece of this.pieces) {
            // Piece movement animation, only if necessary
            if (Math.abs(piece.pos.x - piece.target.x) > 1 / 1000 || Math.abs(piece.pos.y - piece.target.y) > 1 / 1000) {
                piece.move();
            }

            // Display path
            p5.push();
            const path = piece.path;
            for (let cell of path) {
                p5.push();
                p5.translate(cell.x * config.size, cell.y * config.size);
                if (cell.reachable) {
                    p5.fill(0, 255, 0, 40);
                } else {
                    p5.fill(255, 0, 0, 40);
                }
                p5.rect(0, 0, config.size, config.size);
                p5.pop();
            }

            // Display piece
            p5.push();
            p5.translate(piece.pos.x * config.size, piece.pos.y * config.size);
            p5.fill(config.colors[piece.color]);
            if (piece.status === 'selected') {
                // Hero is selected, show it with a stroke
                p5.stroke(0, 20);
                p5.strokeWeight(4);
                // p5.noFill();
                p5.ellipse(config.size/2, config.size/2, 20, 20);
            }

            p5.stroke(0, 20);
            p5.strokeWeight(4);
            p5.ellipse(config.size/2, config.size/2, 16, 16);
            p5.pop();
        }
    }
}
