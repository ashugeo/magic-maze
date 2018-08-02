import config from './config';

export default {
    init() {
        this.$clock = document.getElementById('clock');
        this.ticker();
        this.interval = setInterval(() => { this.ticker() }, 1000);
    },

    tick: 0,
    inverted: false,
    elapsed: 0,
    remaining: config.timer,

    ticker() {
        this.display();

        // No time left
        if (this.remaining === 0) {
            this.stop();
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
        this.$clock.innerHTML = this.toString(this.remaining);
    }
}
