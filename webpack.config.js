const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    entry: {
        'play': ['./src/client/play/js/app.js', './src/client/play/scss/play.scss'],
        'create': ['./src/client/create/js/main.js', './src/client/create/scss/create.scss']
    },
    output: {
        path: path.resolve(__dirname, './public/'),
        filename: '[name]/bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name]/main.css',
                        }
                    },
                    {
                        loader: 'extract-loader'
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            minimize: process.env.NODE_ENV === 'production' ? true : false
                        }
                    },
                    {
                        loader: 'sass-loader'
                    }
                ]
            }
        ]
    },
    optimization: {
        minimizer: process.env.NODE_ENV === 'production' ? [new UglifyJsPlugin()] : [],
    },
    watch: process.env.NODE_ENV === 'production' ? false : true
}
