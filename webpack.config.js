const path = require('path');

module.exports = {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    entry: {
        'play': './src/client/play/js/app.js',
        'create': './src/client/create/js/main.js'
    },
    output: {
        path: path.resolve(__dirname, './public/'),
        filename: '[name]/bundle.js'
    },
    watch: process.env.NODE_ENV === 'production' ? false : true
}
