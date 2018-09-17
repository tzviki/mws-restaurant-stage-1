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
  plugins: [
    new CopyWebpackPlugin([
        { from: 'static' }
    ]),
    new WebpackPwaManifest({
      name: 'My Progressive Web App',
      short_name: 'MyPWA',
      description: 'My awesome Progressive Web App!',
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