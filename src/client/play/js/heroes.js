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
            // Don't display hidden heroes
            if (hero.display === false) continue;

            const targetX = (hero.cell.x - Math.floor(hero.cell.y / 4) * .85 + [.5, .36, .18, 0][hero.cell.x % 4]) * config.size + 8;
            const targetY = (hero.cell.y + Math.floor(hero.cell.x / 4) * .85 + [.5, .36, .18, 0][hero.cell.y % 4]) * config.size + 8;

            if (force) {
                hero.x = targetX;
                hero.y = targetY;
            }

            let deltaX = targetX - hero.x;
            let deltaY = targetY - hero.y;
            
            const x = hero.x + (deltaX < 0 ? Math.max(-config.heroSpeed, deltaX) : Math.min(config.heroSpeed, deltaX));
            const y = hero.y + (deltaY < 0 ? Math.max(-config.heroSpeed, deltaY) : Math.min(config.heroSpeed, deltaY));

            hero.x = x;
            hero.y = y;

            ui.setAttribute(`hero-${hero.id}`, 'transform', `translate(${x} ${y})`);

            if (hero.status === 'selected') ui.setAttribute(`hero-${hero.id}`, 'stroke-width', '2');
            else ui.setAttribute(`hero-${hero.id}`, 'stroke-width', '1');
        }
    }
}
