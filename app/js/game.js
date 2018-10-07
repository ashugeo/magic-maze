import ai from './ai';
import config from './config';

export default {

    scenario: 0,
    admin: false,

    init(options) {
        this.scenario = 1;

        if (options) {
            this.admin = true;
            ai.init(options);
        }
    },

    // TODO: win and lose
    win() {
        console.log('game won!');
    },

    lose() {
        console.log('game lost!');
    }
}
