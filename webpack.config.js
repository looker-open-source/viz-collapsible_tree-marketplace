var path = require('path');

const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

var webpackConfig = {
  mode: 'production',
  entry: {
    collapsible_tree: './src/collapsible_tree/collapsible_tree.ts',
  },
  output: {
    filename: 'dist/bundle.js',
    path: path.resolve(__dirname),
    library: '[name]',
    libraryTarget: 'umd',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [new UglifyJSPlugin()],
  module: {
    rules: [
      {test: /\.js$/, loader: 'babel-loader'},
      {test: /\.ts$/, loader: 'ts-loader'},
      {test: /\.css$/, loader: ['to-string-loader', 'css-loader']},
    ],
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
};

module.exports = webpackConfig;
