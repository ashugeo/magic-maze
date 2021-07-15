import ai from './ai';
import board from './board';
import camera from './camera';
import clock from './clock';
import config from './config';
import events from './events';
import game from './game';
import Hero from './hero';
import heroes from './heroes';
import player from './player';
import Tile from './tile';
import tiles from './tiles';

const allTiles = require('../data/tiles.json');
const scenarios = require('../data/scenarios.json');

export default {
    start(options) {
        game.init(options);
        const deck = this.buildDeck(options.scenario);
        board.init(options.board);
        camera.init();
        tiles.init(deck, options.tiles);
        events.init();
        heroes.init(options.heroes);
        clock.init(options.clock);
        if (options.roles) player.setRoles(options.roles);
        if (game.isAdmin()) ai.run();

        function draw() {
            if (camera.autopan) camera.update();
            camera.zoom();
            camera.move();
            
            // tiles.display();
            heroes.display();

            events.mouseMove();
            
            requestAnimationFrame(draw);
        }
        requestAnimationFrame(draw);
    },

    buildDeck(scenario) {
        if (scenario > 7 && scenario !== 15) scenario = 7;
        let deck = { tiles: [], firstInStock: null };
        const ids = scenarios[scenario].tiles;

        deck.firstInStock = scenarios[scenario].firstInStock;

        for (let id of ids) {
            deck.tiles[id] = allTiles[id];
        }

        return deck;
    }
}
