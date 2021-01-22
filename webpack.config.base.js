/**
 * @file Webpack basic configuration file.
 */

const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

module.exports = {
  entry: {
    app: './front/js/app.js',
  },
  output: {
    path: path.resolve(__dirname, 'public/dist'),
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
        enforce: 'pre',
        query: {
          configFile: './.eslintrc',
        },
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.scss$/,
        // exclude: /front/,
        // exclude: path.resolve(__dirname, 'front/css/app.scss'),
        
        use: [
          // {
          //   loader: 'style-loader'
          // },
          {
            loader: 'css-loader'
          },
          {
            loader: 'sass-loader'
          }
        ]
          
      },
    ],
  },
};