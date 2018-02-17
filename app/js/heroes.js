import config from './config';
import board from './board';

export default {

    pieces: [],

    Hero: class Hero {
        constructor() {
            this.id = Hero.incID(),
            this.color = config.heroes[this.id],
            this.pos = {
                x: 0,
                y: 0
            },
            this.status = ''
        }

        static incID() {
            if (this.latestId === undefined) {
                this.latestId = 0;
            } else {
                this.latestId++;
            }
            return this.latestId;
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
            this.pieces[i].pos = this.initPos[i];
            this.pieces[i].status = 'set';
        }
    },

    display() {
        p5.noStroke();
        for (let piece of this.pieces) {
            p5.push();
            p5.translate(piece.pos.x * config.size, piece.pos.y * config.size);
            p5.fill(config.colors[piece.color]);
            if (piece.status === 'selected') {
                p5.stroke(255);
                p5.strokeWeight(2);
            }
            p5.ellipse(config.size/2, config.size/2, 20, 20);
            p5.pop();
        }
    }
}
