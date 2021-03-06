/**
 * @file Webpack configuration file for development.
 */

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const StyleLintPlugin = require('stylelint-bare-webpack-plugin');

const config = require('./webpack.config.base');

config.mode = 'development';

config.output.filename = 'js/app.js';

config.plugins = [
  new MiniCssExtractPlugin({
    filename: 'css/app.css',
  })
  // new StyleLintPlugin({
  //   syntax: 'scss',
  //   failOnError: false,
  //   quiet: true
  // })
];

config.optimization = {
  runtimeChunk: false,
  splitChunks: {
    cacheGroups: {
      commons: {
        test: /[\\/]node_modules[\\/]/,
        name: 'app.vendor',
        filename: 'js/app.vendor.js',
        chunks: 'all',
      },
    },
  },
};


// config.rules = [
//   {
//     test: /\.s[ac]ss$/i,
//     use: [
//       // Creates `style` nodes from JS strings
//       "style-loader",
//       // Translates CSS into CommonJS
//       "css-loader",
//       // Compiles Sass to CSS
//       "sass-loader",
//     ],
//   },
// ]




module.exports = config;
