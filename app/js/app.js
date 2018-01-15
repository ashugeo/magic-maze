import p5 from 'p5';
import sketch from './sketch'
import Tile from './tile.js';

window.tiles = [];

fetch('data/tiles.json').then(response => response.json()).then(data => {
    window.json = data;
    new p5(sketch);
    tiles.push(new Tile(0));
    tiles[0].set(10, 10);
});
