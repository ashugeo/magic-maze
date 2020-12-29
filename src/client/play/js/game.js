import ai from './ai';
import clock from './clock';
import config from './config';
import events from './events';
import ui from './ui';
import overlay from "./overlay";

export default {
    scenario: 0,
    players: 0,
    admin: false,
    phase: 0, // 0: not started, 1: exploring, 2: escaping, 3: won, 4: lost
    paused: false,

    init(options) {
        this.scenario = options.scenario;
        this.players = options.members.filter(m => !m.isSpectator);
        this.setPhase(options.gamePhase || 1);

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

    pause() {
        if (this.isEnded()) return;
        events.pauseGame(true);
    },

    resume() {
        if (this.isEnded()) return;
        events.pauseGame(false);
    },

    setPaused(isPaused, byName) {
        this.paused = isPaused;

        if (this.isEnded()) {
            overlay.forceClosePause();
            return;
        }

        if (isPaused) {
            overlay.showPause(`Paused by ${byName}...`, () => this.resume());
        } else {
            overlay.forceClosePause();
            ai.run();
        }
    },

    isPaused() {
        return this.paused;
    },

    // TODO: win and lose
    win() {
        console.log('game won!');
        clock.stop();
        this.phase = 3;

        overlay.showGameOver('Game won!');
    },

    lose() {
        console.log('game lost!');
        clock.stop();
        this.phase = 4;

        // Cancel current action
        if (events.action !== '') events.cancel();

        if (this.players === 1 && ai.bots.length === 0) {
            // Admin is the only player, disable nextAction button
            ui.addClass('nextAction', 'disabled');
        }

        overlay.showGameOver('Game lost!');
    }
}
