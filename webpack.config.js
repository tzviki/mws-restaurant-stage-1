const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest')
 
module.exports = {
  entry: {
      register_sw: './src/register_sw.js',
      sw: './src/sw.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  },
  devServer: {
    contentBase: './dist'
  },
  plugins: [
    new CopyWebpackPlugin([
        { from: 'static' }
    ]),
    new WebpackPwaManifest({
      name: 'Restaurant Reviews',
      short_name: 'Reviews',
      description: 'Restaurants listing and reviews',
      background_color: '#ffa500',
      theme_color: '#ffa',
      crossorigin: 'use-credentials', //can be null, use-credentials or anonymous
      icons: [
        {
          src: path.resolve('img/icon.png'),
          sizes: [64,192,512] // multiple sizes
        }
      ],
      fingerprints: false
    })
]
};