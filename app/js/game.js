import config from './config';
import ai from './ai';

export default {

    scenario: 0,
    admin: false,

    init(options) {
        this.scenario = 1;

        if (options) {
            this.admin = true;
            ai.init(options);
        }
    }
}
