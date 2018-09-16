const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
 
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
    ])
]
};