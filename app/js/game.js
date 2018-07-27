import config from './config';
import pieces from './pieces';
import board from './board';

export default {

    scenario: 0,

    init() {
        this.scenario = 1;
    },

    checkForWin() {
        for (let piece of pieces.all) {
            // Has every hero stolen their article?
            if (!piece.hasStolen()) return false;

            // Is every hero out?
            if (!piece.hasExited()) return false;
        }
    }
}
