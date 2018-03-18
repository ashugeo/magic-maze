import p5 from 'p5';
import sketch from './sketch'
import board from './board';
import Tile from './tile';
import Hero from './hero';
import pieces from './pieces';

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

socket.on('hero', (data) => {
    const hero = pieces.pieces[data.id];
    const cell = data.cell;
    hero.set(cell);
});

socket.on('board', (data) => {
    board.save(data.x, data.y, data.cell)
});

socket.on('tile', (data) => {
    const tile = new Tile(data.tile.id);
    tile.rotate = data.tile.rotate;
    window.tiles.push(tile);
    tile.set(data.x, data.y);
});
