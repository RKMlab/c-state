var path = require('path')
var webpack = require('webpack')
var ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
  entry: {
    build: "./src/main.js",
    vendor: ['d3', 'vue', 'element-ui', 'lodash']
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    filename: '[name].js?[hash]'
  },
  module: {
    loaders: [
      {
        test: /\.(vue$|vue\.html$)/,
        loader: 'vue-loader',
        options: {
          loaders: {
            css: ['css-hot-loader'].concat(ExtractTextPlugin.extract({
                use: 'css-loader',
                fallback: 'vue-style-loader'
              }))
          }
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['css-hot-loader'].concat(ExtractTextPlugin.extract({
          use: ['css-loader'],
          fallback: 'style-loader'
        })),
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)(\?\S*)?$/,
        loader: 'file-loader'
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?\S*)?$/,
        loader: 'file-loader',
        query: {
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true
  },
  plugins: [
    new ExtractTextPlugin("styles.css"),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest'
    })
  ],
  devtool: '#eval-source-map'
}

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ])
}