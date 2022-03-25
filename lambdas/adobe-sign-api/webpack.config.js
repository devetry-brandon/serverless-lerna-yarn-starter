const path = require('path');

module.exports = {
  entry: {
    'agreements-controller': './lib/agreements-controller.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'commonjs2',
  },
  target: 'node',
  devtool: 'source-map'
};