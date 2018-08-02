import config from './config';
import pieces from './pieces';
import board from './board';
import Bot from './bot'

export default {

    scenario: 0,
    bots: 0,

    init(options) {
        this.scenario = 1;
        this.bots = options.bots;
        if (this.bots > 0) {
            for (let i = 0; i < this.bots; i += 1) {
                const bot = new Bot(i, options.botsRoles[i]);
                bot.init();
            }
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
