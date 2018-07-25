const codes = [
    '1011100000001110101000000000111010110000010010111011000001101111',
    '0101111111111111011111111111110111111111100100101111100100101110',
    '1111111111011111101010000100111111110101001110001111010111110111',
    '1001110000111100011000011110010111110101101101001111000110100110',
    '1001110010011100010000010110010101110011110000011011100001100111'
];

let json = {};

for (id in codes) {
    json[id] = {};

    let d = 0;
    for (let i = 0; i < 4; i += 1) {
        json[id][i] = {};

        for (let j = 0; j < 4; j += 1) {
            json[id][i][j] = {};
            json[id][i][j]['walls'] = {};

            json[id][i][j]['walls']['top'] = codes[id][d] === "1";
            d += 1;
            json[id][i][j]['walls']['right'] = codes[id][d] === "1";
            d += 1;
            json[id][i][j]['walls']['bottom'] = codes[id][d] === "1";
            d += 1;
            json[id][i][j]['walls']['left'] = codes[id][d] === "1";
            d += 1;

            json[id][i][j]['item'] = false;
            json[id][i][j]['escalator'] = false;
        }
    }
}

console.log(JSON.stringify(json, null, '    '));
