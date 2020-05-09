import board from './board';
import camera from './camera'
import config from './config';
import Hero from './hero';
import tiles from './tiles';
import ui from './ui';

export default {
    all: [],

    init(heroes) {
        for (let i = 0; i < 4; i += 1) {
            this.all.push(new Hero(i));
            if (heroes) {
                this.all[i].set(
                    heroes[i].cell.x,
                    heroes[i].cell.y
                );
            } else {
                this.all[i].set(
                    config.firstTile.x + [1, 2, 2, 1][i],
                    config.firstTile.y + [1, 1, 2, 2][i]
                );
            }
            this.all[i].pos = this.all[i].target;
            this.all[i].status = 'set';

            const color = config.colors[this.all[i].color];
            const svg = `<circle class="hero" id="hero-${i}" cx="0" cy="0" r="8" fill="${color}" stroke="black" />`;
            ui.addHTML('heroes', svg);
        }

        // Move heroes to starting position
        this.display(true);
    },

    get() {
        return this.all;
    },

    findByColor(color) {
        for (let hero of this.all) {
            if (hero.color === color) return hero;
        }
    },

    display(force = false) {
        for (let hero of this.all) {
            hero.display(force);
        }
    }
}
