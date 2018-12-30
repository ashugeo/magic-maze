import ai from './ai';
import board from './board';
import clock from './clock';
import config from './config';
import events from './events';
import game from './game';
import Hero from './hero';
import heroes from './heroes';
import p5 from 'p5';
import player from './player';
import sketch from './sketch';
import Tile from './tile';
import tiles from './tiles';

const allTiles = require('../data/tiles.json');
const scenarios = require('../data/scenarios.json');

export default {
    start(options) {
        new p5(sketch);
        game.init(options);
        const deck = this.buildDeck(options.scenario);
        tiles.init(deck);
        board.init();
        events.init();
        heroes.init();
        clock.init();
        if (options.roles) {
            player.init();
            player.setRoles(options.roles);
        }
        if (game.isAdmin()) ai.run();
    },

    buildDeck(scenario) {
        let deck = {};
        const ids = scenarios[scenario].tiles;

        for (let id of ids) {
            deck[id] = allTiles[id];
        }

        return deck;
    }
}
