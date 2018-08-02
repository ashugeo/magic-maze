import config from './config';
import pieces from './pieces';
import board from './board';
import Bot from './bot'

export default {

    scenario: 0,
    bots: [],

    init(options) {
        this.scenario = 1;
        for (let i = 0; i < options.bots; i += 1) {
            this.bots.push(new Bot(i, options.botsRoles[i]));
        }
    },

    initBots() {
        for (let bot of this.bots) {
            bot.init();
        }
    },

    checkForWin() {
        for (let piece of pieces.all) {
            // Has every hero stolen their article?
            if (!piece.hasStolen()) return false;

            // Is every hero out?
            if (!piece.hasExited()) return false;

            return true;
        }
    }
}
