const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry:  [
    './src/index'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js' //Template based on keys in entry above
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('common.js'),
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
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    /*new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })*/
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
      }
    ]
  }
};
