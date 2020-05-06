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
    },

    get() {
        return this.all;
    },

    findByColor(color) {
        for (let hero of this.all) {
            if (hero.color === color) return hero;
        }
    },

    display() {
        // p5.noStroke();
        for (let hero of this.all) {

            // Don't display hidden heroes
            if (hero.display === false) continue;

            // Fade out and disappear
            if (hero.opacity < 0) {
                hero.display = false;
            }

            // Hero movement animation, only if necessary
            let deltaX = hero.target.x - hero.pos.x;
            let deltaY = hero.target.y - hero.pos.y;
            let delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            if (delta > 1 / config.heroSpeed) {
                hero.move();
            } else if (!hero.selectable) {
                hero.move(true);
            }

            // Display path
            // p5.push();
            const path = hero.path;
            for (let cell of path) {
                const boardCell = board.get(cell.x, cell.y);
                const tileCell = boardCell.tileCell;

                let x1 = 0;
                let y1 = 0;
                let l = 1;
                let h = 1;
                let tileShift = {x: 0, y: 0};

                if (tileCell) {
                    tileShift = tiles.getTile(boardCell.tileID).shift;
                    const walls = boardCell.walls;
                    const s = .16; // Shift

                    x1 = [.32, .16, 0, -.16][tileCell.x];
                    y1 = [.32, .16, 0, -.16][tileCell.y];
                    let x2 = 1 + [.16, 0, -.16, -.32][tileCell.x];
                    let y2 = 1 + [.16, 0, -.16, -.32][tileCell.y];

                    if (walls.left && tileCell.x === 3) {
                        x1 += .22;
                    } else if (!walls.left && tileCell.x === 0) {
                        x1 -= .32;
                    }

                    if (walls.right && tileCell.x === 0) {
                        x2 -= .22;
                    } else if (!walls.right && tileCell.x === 3){
                        x2 += .32;
                    }

                    if (walls.top && tileCell.y === 3) {
                        y1 += .16;
                    } else if (!walls.top && tileCell.y === 0) {
                        y1 -= .32;
                    }

                    if (walls.bottom && tileCell.y === 0) {
                        y2 -= .22;
                    } else if (!walls.bottom && tileCell.y === 3) {
                        y2 += .32;
                    }

                    l = x2 - x1;
                    h = y2 - y1;
                }

                if (cell.reachable) {
                    // p5.fill(0, 255, 0, 40);
                } else {
                    // p5.fill(255, 0, 0, 40);
                }

                // p5.push();
                // p5.translate(cell.x * config.size + tileShift.x, cell.y * config.size + tileShift.y);
                // p5.rect(x1 * config.size, y1 * config.size, l * config.size, h * config.size);
                // p5.pop();
            }

            // Display hero
            // p5.push();
            // p5.translate(hero.pos.x * config.size, hero.pos.y * config.size);

            // Circle animation
            // p5.noFill();
            // p5.stroke(config.colors[hero.color]);
            // p5.strokeWeight(2);
            // p5.ellipse(config.size / 2, config.size / 2, 18 + Math.cos(p5.frameCount / 10));

            // Fade out animation
            // if (hero.hasExited()) hero.opacity -= 8;

            // Hexadecimal to p5 color array
            // let color = p5.color(config.colors[hero.color]).levels;
            // p5.fill(color[0], color[1], color[2], hero.opacity);

            // if (hero.status === 'selected') {
            //     // Hero is selected, show it with a stroke
            //     p5.stroke(0, 20 * hero.opacity / 255);
            //     p5.strokeWeight(4);
            //     p5.ellipse(config.size / 2, config.size / 2, 16);
            // }

            // p5.stroke(0, 20 * hero.opacity / 255);
            // p5.strokeWeight(4);
            // p5.ellipse(config.size / 2, config.size/2, 12);
            // p5.pop();

            // const shiftX = [.5, .35, .2, 0][hero.pos.x % 4];
            // const shiftY = [.5, .35, .2, 0][hero.pos.y % 4];

            const x = hero.pos.x * config.size + 8 - 0.85 * Math.floor(hero.pos.y / 4) * config.size;
            const y = hero.pos.y * config.size + 8 + 0.85 * Math.floor(hero.pos.x / 4) * config.size;

            ui.setAttribute(`hero-${hero.id}`, 'transform', `translate(${x} ${y})`);

            if (hero.status === 'selected') ui.setAttribute(`hero-${hero.id}`, 'stroke-width', '2');
            else ui.setAttribute(`hero-${hero.id}`, 'stroke-width', '1');
        }
    }
}
