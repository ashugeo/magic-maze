import p5 from 'p5';
import sketch from './sketch'
import Tile from './tile.js';

window.tiles = [];
window.json = [];

const tiles = 3;
fetchJSON(0);

function fetchJSON(i) {
    fetch('data/tile' + i + '.json').then(response => response.json()).then(data => {
        window.json.push(data);

        if (i < tiles - 1) {
            fetchJSON(i + 1);
        } else {
            new p5(sketch);
            window.tiles.push(new Tile(0));
            window.tiles[0].set(10, 10);
        }
    });
}
