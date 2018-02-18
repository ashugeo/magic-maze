import config from './config';
import board from './board';

export default {

    pieces: [],

    Hero: class Hero {
        constructor() {
            this.id = Hero.incID(),
            this.color = config.heroes[this.id],
            this.cell = {
                x: 0,
                y: 0
            },
            this.status = '',
            this.path = []
        }

        static incID() {
            if (this.latestId === undefined) {
                this.latestId = 0;
            } else {
                this.latestId++;
            }
            return this.latestId;
        }

        move(cell) {
            this.pos = {
                x: this.pos.x + (this.cell.x - this.pos.x) / config.heroSpeed,
                y: this.pos.y + (this.cell.y - this.pos.y) / config.heroSpeed
            }
        }

        set(cell) {
            this.cell = {
                x: cell.x,
                y: cell.y
            };
            this.path = [];
            this.move(cell)
        }

        showPath(cell) {
            this.path = [];

            const x1 = Math.min(this.pos.x, cell.x);
            const x2 = Math.max(this.pos.x, cell.x);

            const y1 = Math.min(this.pos.y, cell.y);
            const y2 = Math.max(this.pos.y, cell.y);

            // TODO: rework this

            // for (let i = x1; i <= x2; i += 1) {
            //     this.path[i] = [];
            //     for (let j = y1; j <= y2; j += 1) {
            //
            //         // Make sure cell is not outside a tile
            //         if (Object.keys(board[i][j]).length > 0) {
            //             if (x1 === x2) { // Same col
            //                 console.log(board[i][j]);
            //                 if (board[i][j].topWall) {
            //                     this.path[i][j] = 'red';
            //                 } else {
            //                     this.path[i][j] = 'green';
            //                 }
            //
            //             } else if (y1 === y2) { // Same row
            //                 this.path[i][j] = 'green';
            //             }
            //         } else {
            //             if (x1 === x2 || y1 === y2) this.path[i][j] = 'red';
            //         }
            //     }
            // }
        }
    },

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
            this.pieces.push(new this.Hero());
            this.pieces[i].cell = this.initPos[i];
            this.pieces[i].pos = this.initPos[i];
            this.pieces[i].status = 'set';
        }
    },

    display() {
        p5.noStroke();
        for (let piece of this.pieces) {
            piece.move(piece.cell);
            console.log(piece);

            p5.push();
            p5.translate(piece.pos.x * config.size, piece.pos.y * config.size);
            p5.fill(config.colors[piece.color]);
            if (piece.status === 'selected') {
                p5.stroke(0);
            }

            p5.ellipse(config.size/2, config.size/2, 20, 20);
            p5.pop();

            p5.push();

            const path = piece.path;

            if (path.length > 0) {
                for (let i = 0; i < path.length; i += 1) {
                    if (path[i]) {
                        for (let j = 0; j < path[i].length; j += 1) {
                            if (path[i][j]) {
                                p5.push();
                                p5.translate(i * config.size, j * config.size);
                                if (path[i][j] === 'green') {
                                    p5.fill(0, 255, 0, 40);
                                } else if (path[i][j] === 'red') {
                                    p5.fill(255, 0, 0, 40);
                                }

                                p5.rect(0, 0, config.size, config.size);
                                p5.pop();
                            }
                        }
                    }
                }
            }
        }
    }
}
