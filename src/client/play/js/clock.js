import config from './config';
import game from './game';
import ui from './ui';

export default {
    tick: 0,
    elapsed: 0,
    remaining: 0,
    inverted: false,

    init(clock) {
        this.tick = clock ? clock.tick : 0;
        this.elapsed = clock ? clock.elapsed : 0;
        this.remaining = clock ? clock.remaining : config.timer;
        this.inverted = clock ? clock.inverted : false;

        // Start clock
        this.ticker();
        this.interval = setInterval(() => { this.ticker() }, 1000);
    },
    
    get() {
        const clock = {
            tick: this.tick,
            elapsed: this.elapsed,
            remaining: this.remaining,
            inverted: this.inverted
        }
        return clock;
    },

    ticker() {
        this.display();

        // No time left
        if (this.remaining === 0) {
            this.stop();
            game.lose();
            return;
        }

        this.tick += 1;
        this.elapsed += 1;
        this.remaining -= 1;
    },

    stop() {
        clearInterval(this.interval);
    },

    invert() {
        this.inverted = !this.inverted;
        let r = this.remaining;
        this.remaining = this.elapsed;
        this.elapsed = r;
    },

    toString(time) {
        let minutes = Math.floor(time / 60);
        let seconds = time % 60;
        seconds = seconds < 10 ? '0' + seconds : seconds;
        // let string = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
        return `${minutes}m ${seconds}s`;
    },

    display() {
        ui.setHTML('clock', this.toString(this.remaining));
    }
}
