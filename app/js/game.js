import ai from './ai';
import config from './config';

export default {

    scenario: 0,
    vortex: true,
    admin: false,

    init(options) {
        this.scenario = options.scenario;

        if (options.admin) {
            this.admin = true;
            ai.init(options);
        }
    },

    isAdmin() {
        return this.admin;
    },

    setVortex(value) {
        this.vortex = value;
    },

    isVortex() {
        return this.vortex;
    },

    // TODO: win and lose
    win() {
        console.log('game won!');
    },

    lose() {
        console.log('game lost!');
    }
}
