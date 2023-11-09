'use strict';

const path = require('path');
const webpack = require('webpack');
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');
require('./build-css');

const isProduction = !!process.env.PRODUCTION;

module.exports = () => {
  const plugins = [
    new webpack.DefinePlugin({
      // This prevents htmltojsx from bundling jsdom
      IN_BROWSER: true,
    }),
  ];

  if (isProduction) {
    plugins.push(
      new ParallelUglifyPlugin({
        uglifyJS: {},
      })
    );
  }

  return {
    entry: path.join(__dirname, './src/app.js'),
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, './dist'),
      publicPath: '/dist/',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: [{ loader: 'babel-loader' }],
        },
      ],
    },
    mode: 'development',
    plugins,
    devtool: !isProduction ? 'eval-cheap-module-source-map' : false,
    devServer: {
      static: './repl',
    },
    node: {
      global: true,
    },
    performance: { hints: false },
    resolve: {
      fallback: {
        path: require.resolve('path-browserify'),
      },
      modules: ['node_modules'],
    },
  };
};
