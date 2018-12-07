import ai from './ai';
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
        this.ended = true;
        this.phase = 3;
    },

    lose() {
        console.log('game lost!');
        this.ended = true;
        this.phase = 4;

        // Cancel current action
        if (events.action !== '') events.cancel();

        // Disable nextAction button
        document.getElementById('nextAction').classList.add('disabled');
    }
}
