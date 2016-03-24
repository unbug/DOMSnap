// For instructions about this file refer to
// webpack and webpack-hot-middleware documentation
var webpack = require('webpack');
var path = require('path');

exports.build = {
  resolve: {
    root: [
      path.resolve('./lib')
    ]
  },
  entry: './lib/DOMSnap.js',
  output: {
    filename: "DOMSnap.js"
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
    })
  ]
};
