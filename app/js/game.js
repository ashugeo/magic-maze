import ai from './ai';
import config from './config';

export default {

    scenario: 0,
    admin: false,

    init(options) {
        if (options) {
            this.admin = true;
            this.scenario = options.scenario;
            ai.init(options);
        }
    },

    isAdmin() {
        return this.admin;
    },

    // TODO: win and lose
    win() {
        console.log('game won!');
    },

    lose() {
        console.log('game lost!');
    }
}
