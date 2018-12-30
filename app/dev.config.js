const path = require('path');

module.exports = {
    mode: "development",
    entry: "./js/app.js",
    output: {
        path: path.resolve(__dirname, "js"),
        filename: "bundle.js"
    },
    watch: true
}
