import ai from './ai';
import config from './config';
import events from './events';

export default {

    scenario: 0,
    players: 0,
    vortex: true,
    admin: false,
    ended: false,

    init(options) {
        this.scenario = options.scenario;
        this.players = options.players;

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

    isEnded() {
        return this.ended;
    },

    // TODO: win and lose
    win() {
        console.log('game won!');
        this.ended = true;
    },

    lose() {
        console.log('game lost!');
        this.ended = true;

        // Cancel current action
        if (events.action !== '') events.cancel();

        // Disable nextAction button
        document.getElementById('nextAction').classList.add('disabled');
    }
}
