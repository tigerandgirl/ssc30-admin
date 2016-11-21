var path = require('path');
var webpack = require('webpack');

module.exports = {
    //devtool: 'source-map',
    //devtool: 'cheap-module-eval-source-map',

    // build files for chrome extension also client
    entry: {
      'client/index.build_baozhangren': [
        './src/index.build_baozhangren'
      ],
      'client/index.build_zuoyeren': [
        './src/index.build_zuoyeren'
      ]/*,
      'chrome/index': [
        './src/index.build_baozhangren'
      ]*/
    },

    //输入目标
    output: {
      path: path.join(__dirname),
      filename: '[name].js', //Template based on keys in entry above
      publicPath: '/client/'
    },

    //common.js 是公共模块
    plugins: [
        new webpack.optimize.CommonsChunkPlugin('client/common.build.js'),
        //new webpack.optimize.CommonsChunkPlugin('chrome/common.js'),
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
        // // Transfer Files
        // new TransferWebpackPlugin([
        //     {from: 'www'},
        // ], path.resolve(__dirname, 'src')),
        // new ManifestPlugin({
        //     fileName:  'manifest.json'
        // })
    ],

    resolve: {
        extensions: ['', '.js', '.jsx']
    },

    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    presets: ['es2015', 'stage-0', 'react']
                },
                include: __dirname
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


