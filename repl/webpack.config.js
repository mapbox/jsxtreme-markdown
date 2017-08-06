'use strict';

const path = require('path');
const webpack = require('webpack');
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');

const isProduction = !!process.env.PRODUCTION;

module.exports = () => {
  const plugins = [
    new webpack.DefinePlugin({
      // This prevents htmltojsx from bundling jsdom
      IN_BROWSER: true
    })
  ];

  if (isProduction) {
    plugins.push(
      new ParallelUglifyPlugin({
        uglifyJS: {}
      })
    );
  }

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
          use: [{ loader: 'babel-loader' }]
        }
      ]
    },
    plugins,
    devtool: !isProduction ? 'cheap-module-eval-source-map' : false,
    node: {
      fs: 'empty',
      module: 'empty',
      child_process: 'empty'
    }
  };
};
