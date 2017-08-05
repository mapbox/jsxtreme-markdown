'use strict';

const path = require('path');

module.exports = () => {
  return {
    entry: path.join(__dirname, './src/app.js'),
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, './dist'),
      publicPath: '/dist/'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader'
        },
        {
          test: /\.css$/,
          use: [{ loader: 'style-loader' }, { loader: 'css-loader' }]
        }
      ]
    }
  };
};
