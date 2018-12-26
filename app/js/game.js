import ai from './ai';
import clock from './clock';
import config from './config';
import events from './events';

export default {

    scenario: 0,
    players: 0,
    admin: false,
    phase: 0, // 0: not started, 1: exploring, 2: escaping, 3: won, 4: lost

    init(options) {
        this.scenario = options.scenario;
        this.players = options.players;
        this.setPhase(1);

        if (options.admin) {
            this.admin = true;
            ai.init(options);
        }
    },

    isAdmin() {
        return this.admin;
    },

    isScenario(scenario) {
        return this.scenario === scenario;
    },

    setPhase(value) {
        this.phase = value;
    },

    isPhase(phase) {
        return this.phase === phase;
    },

    isEnded() {
        return this.phase >= 3;
    },

    // TODO: win and lose
    win() {
        console.log('game won!');
        clock.stop();
        this.phase = 3;
    },

    lose() {
        console.log('game lost!');
        clock.stop();
        this.phase = 4;

        // Cancel current action
        if (events.action !== '') events.cancel();

        if (this.players === 1 && ai.bots.length === 0) {
            // Admin is the only player, disable nextAction button
            document.getElementById('nextAction').classList.add('disabled');
        }
    }
}
