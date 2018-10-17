import helpers from './helpers';
import Tile from './tile';

export default {
    all: [], // Array of Tile objects
    deck: [], // Array of IDs (growing order)
    stock: [], // Array of IDs (to be mixed)
    board: [], // Array of IDs (chronologically)
    pickedTile: false, // ID or false

    init(deck) {
        for (let id of Object.keys(deck)) {
            id = parseInt(id);
            this.deck.push(id);
            this.stock.push(id);
            const tile = this.stringToTile(id, deck[id]);
            this.all.push(new Tile(tile));
        }

        const firstTile = this.stock[0];
        this.stock.shift();
        this.stock = helpers.shuffleArray(this.stock);
        this.stock.unshift(firstTile);
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
        return this.all.find(t => { return t.id === id; });
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

    stringToTile(id, string) {
        let json = {};
        json.id = id;
        json.data = {};

        // Divide string into array of 4-character blocks
        let blocks = [];
        for (let i = 0; i < 16; i += 1) {
            const block = string.substring(i * 4, i * 4 + 4);
            blocks.push(block);
        }

        // Build each cell
        for (let x = 0; x < 4; x += 1) {
            json.data[x] = {};

            for (let y = 0; y < 4; y += 1) {
                json.data[x][y] = {};
                const cell = json.data[x][y];

                // Get corresponding block
                const block = blocks[x * 4 + y];

                // First two bits: walls
                let bits = block.substring(0, 2);
                let schema = parseInt(bits).toString(3);
                while (schema.length < 4) {
                    schema = '0' + schema;
                }

                cell.walls = {};
                for (let i = 0; i < 4; i += 1) {
                    const side = ['top', 'right', 'bottom', 'left'][i];

                    if (schema[i] === '0') {
                        cell.walls[side] = false;
                    } else if (schema[i] === '1') {
                        cell.walls[side] = true;
                    } else if (schema[i] === '2') {
                        cell.walls[side] = 'orange';
                    }
                }

                // 3rd bit: item
                let bit = block[2];
                if (bit === '0') {
                    // No item
                    cell.item = false;
                } else {
                    cell.item = {};
                    const index = parseInt(bit, 36) - 1;
                    if (index < 16) {
                        // Colored item
                        cell.item.type = ['gate', 'vortex', 'article', 'exit'][Math.floor(index / 4)];
                        const color = ['green', 'orange', 'purple', 'yellow'][index % 4];
                        cell.item.color = color;
                    } else {
                        // No color item
                        cell.item.type = {'h': 'enter', 'i': 'time', 'j': 'crystal', 'k': 'camera'}[bit];
                    }
                }

                // 4th bit: escalator
                bit = block[3];
                if (bit === '0') {
                    // No escalator
                    cell.escalator = false;
                } else {
                    const index = parseInt(bit, 36) - 1;
                    cell.escalator = {
                        'x': Math.floor(index / 4),
                        'y': index % 4
                    };
                }
            }
        }

        return json;
    }
}
