import ai from './ai';
import config from './config';
import helpers from './helpers';
import Tile from './tile';

export default {

    deck: [], // Array of IDs (growing order)
    stock: [], // Array of IDs (to be mixed)
    board: [], // Array of IDs (chronologically)
    tiles: [], // Array of Tile objects
    pickedTile: false,
    scenario: 0,
    admin: false,

    init(deck, options) {
        for (let id in deck) {
            id = parseInt(id);
            this.deck.push(id);
            this.stock.push(id);
            this.tiles.push(new Tile(deck[id]));
        }

        const firstTile = this.stock[0];
        this.stock.shift();
        this.stock = helpers.shuffleArray(this.stock);
        this.stock.unshift(firstTile);

        if (options) {
            this.admin = true;
            this.scenario = options.scenario;
            ai.init(options);
        }
    },

    getFromStock(index) {
        // Get next tile in mixed stock (if no index provided)
        let id = index === undefined ? this.stock[0] : index;

        // Take tile ID out of stock
        this.stock.shift();

        // Save picked tile ID
        this.pickedTile = id;

        // Change tile status to picked
        this.getTile(id).status = 'picked';

        if (!index) return this.getTile(id);
    },

    putBackInStock() {
        this.getTile(this.pickedTile).status = 'stock';
        this.stock.unshift(this.pickedTile);
        this.pickedTile = false;
    },

    getPickedTile() {
        const id = this.pickedTile;
        return this.getTile(id);
    },

    getTile(id) {
        return this.tiles.find(t => { return t.id === id; });
    },

    setTile(id) {
        this.pickedTile = false;
        this.board.push(id);
    },

    getLastTile() {
        const id = this.board[this.board.length - 1];
        return this.getTile(id);
    },

    getStockSize() {
        return this.stock.length;
    },

    isAdmin() {
        return this.admin;
    },

    // TODO: win and lose
    win() {
        console.log('game won!');
    },

    lose() {
        console.log('game lost!');
    }
}
