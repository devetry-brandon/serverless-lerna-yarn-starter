const path = require('path');

module.exports = {
  entry: './lib/agreements-controller.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'agreements-controller.js',
    libraryTarget: 'commonjs2',
  },
  target: 'node',
  devtool: 'source-map'
};