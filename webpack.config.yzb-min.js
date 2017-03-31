/**
 * 友账表
 * - 编译生成混淆压缩后的js
 */

const path = require('path');
const webpack = require('webpack');

// 友账表生产环境服务器
const DEFAULT_PROD_SERVER = '59.110.123.20';
const DEFAULT_PATH_PREFIX = '/ficloud';

module.exports = {
  entry: [
    './src/index-yzb'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.min.js' // Template based on keys in entry above
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('common.min.js'),
    /**
     * This plugin assigns the module and chunk ids by occurence count. What this
     * means is that frequently used IDs will get lower/shorter IDs - so they become
     * more predictable.
     */
    new webpack.optimize.OccurenceOrderPlugin(),
    /**
     * See description in 'webpack.config.dev' for more info.
     */
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production'),
        'PROD_SERVER': JSON.stringify(process.env.PROD_SERVER || DEFAULT_PROD_SERVER),
        'PATH_PREFIX': JSON.stringify(process.env.PATH_PREFIX || DEFAULT_PATH_PREFIX)
      }
    })
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: [/node_modules/, /styles/],
        loaders: ['babel'],
        include: path.join(__dirname, 'src')
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.less$/,
        loader: 'style-loader!css-loader!less-loader'
      },
      {
        test: /\.(png|jpg|bmp)$/,
        loader: 'url-loader?limit=8192'
      },
      {
        test: /\.hbs$/,
        loader: 'handlebars-loader'
      }
    ]
  }
};

/**
 * References
 * 同时编译minified和uncompressed版本
 * http://stackoverflow.com/a/34018909/4685522
 */
