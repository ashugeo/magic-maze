import config from './config';
import helpers from './helpers';
import Tile from './tile';

export default {
    all: [],           // Array of Tile objects
    deck: [],          // Array of IDs (growing order)
    stock: [],         // Array of IDs (to be mixed)
    board: [],         // Array of IDs (chronologically)
    pickedTile: false, // ID or false

    init(deck, tiles) {
        for (let id of Object.keys(deck.tiles)) {
            id = parseInt(id);

            if (tiles) {
                const tile = new Tile(this.stringToTile(id, deck.tiles[id]));

                if (tiles.board.includes(id)) {
                    const t = tiles.all.find(t => t.id === id);
                    tile.set(t.x, t.y);
                }

                this.all.push(tile);
            } else {
                this.deck.push(id);
                this.stock.push(id);
                const tile = this.stringToTile(id, deck.tiles[id]);
                this.all.push(new Tile(tile));
            }
        }

        if (!tiles) {
            const firstTile = this.stock[0];
            this.stock.shift();
            this.stock = helpers.shuffleArray(this.stock);

            if (deck.firstInStock) {
                const index = this.stock.indexOf(deck.firstInStock);
                this.stock.splice(index, 1);
                this.stock.unshift(deck.firstInStock);
            }

            this.stock.unshift(firstTile);
            
            this.getFromStock().set(config.firstTile.x, config.firstTile.y);
        }
    },

    display() {
        // for (let tile of this.all) {
        //     // Don't display stock tiles
        //     if (tile.status === 'stock' || tile.status === 'picked') continue;
    
        //     // Display tile
        //     tile.display();
        // }
    },

    get() {
        const data = {
            all: this.all,
            deck: this.deck,
            stock: this.stock,
            board: this.board
        }

        return data;
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

        const tile = this.getTile(id);

        tile.createSVG();

        if (!index) return tile;
    },

    putBackInStock() {
        const tile = this.getTile(this.pickedTile)
        tile.removeSVG();
        tile.status = 'stock';
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

    isPickedTile() {
        return this.pickedTile;
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
                        // No- or one-color item
                        cell.item.type = {'h': 'enter', 'i': 'time', 'j': 'crystal', 'k': 'camera'}[bit];
                        if (cell.item.type === 'crystal') cell.item.color = 'purple';
                        if (cell.item.type === 'camera') cell.item.color = 'yellow';
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
