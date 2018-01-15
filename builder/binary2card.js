const codes = [
    '1011100000001110101000000000111010110000010010111011000001101111',
    '0101111111111111011111111111110111111111100100101111100100101110',
    '1111100101101111101000101000111010111000010010011111011100110110'
];

let json = {};

for (id in codes) {
    json[id] = {};

    let d = 0;
    for (let i = 0; i < 4; i += 1) {
        json[id][i] = {};

        for (let j = 0; j < 4; j += 1) {
            json[id][i][j] = {};

            json[id][i][j]['topWall'] = codes[id][d];
            d += 1;
            json[id][i][j]['rightWall'] = codes[id][d];
            d += 1;
            json[id][i][j]['bottomWall'] = codes[id][d];
            d += 1;
            json[id][i][j]['leftWall'] = codes[id][d];
            d += 1;

            json[id][i][j]['item'] = false;
            json[id][i][j]['escalator'] = false;
        }
    }
}

console.log(JSON.stringify(json, null, '    '));
