import config from './config';
import board from './board';
import Hero from './hero';

export default {

    pieces: [],

    initPos: [
        {
            x: 11,
            y: 11
        },
        {
            x: 12,
            y: 11
        },
        {
            x: 12,
            y: 12
        },
        {
            x: 11,
            y: 12
        }
    ],

    init() {
        for (let i = 0; i < 4; i += 1) {
            this.pieces.push(new Hero());
            this.pieces[i].cell = this.initPos[i];
            this.pieces[i].pos = this.initPos[i];
            this.pieces[i].status = 'set';
        }
    },

    display() {
        p5.noStroke();
        for (let piece of this.pieces) {
            // Piece movement animation
            piece.move(piece.cell);

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
