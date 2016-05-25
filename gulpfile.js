var gulp = require('gulp');
var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
var nodemon = require('nodemon');
var WebpackDevServer = require('webpack-dev-server');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

// This gulp file configures webpack for both server and client, mostly
// For the server we transpile to ES6 using babel + the babel-loader, and webpack. This outputs a file which we re-run everytime webpack.watch() sees a change.
// For the client we load css anywhere we find it, generate vendor prefixes, and enable nesting. There is more we can do with postcss, but for now keeping it simple.
// We use the webpack loader "react-hot-loader" to live update react components when you save that component. Big updates coming, see https://github.com/gaearon/react-hot-loader
// And of course, babel-loader for ES6 transpiling
// Much of this configuration was adopted from http://jlongster.com/Backend-Apps-with-Webpack--Part-II
// I did not do server-side hot reloading for now as I feel a simple restart works for my needs

// Frontend webpack configuration

var frontendWebpackConfig = {

  // react hot module replacement requires these 2 additional entry files
  entry: [
    'webpack-dev-server/client?http://localhost:3000',
    'webpack/hot/only-dev-server',
    './src/client'
  ],
  output: {
    filename: 'app.js',
    path: __dirname + '/public/',
    publicPath: 'http://localhost:3000/public/'
  },
  module: {
    loaders: [
      {test: /\.js$/, exclude: /node_modules/, loaders: ['react-hot', 'babel-loader'] },
      // this moves all of the individual style.css files that are saved alongside react components into one amalgamated css bundle file.
      {test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader')}
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin( { quiet: true }),
    new webpack.NoErrorsPlugin(),
    new ExtractTextPlugin('style.css', { allChunks: true })
  ],
  // Additional plugins for CSS post processing using postcss-loader
  postcss: [
    require('autoprefixer'), // Automatically include vendor prefixes
    require('postcss-nested') // Enable nested rules, like in Sass
  ]
};

// Server side webpack configuration

var nodeModules = fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  });

var backendWebpackConfig = {
  entry: [
    // 'webpack/hot/signal.js', // this is for monkey-hot-loader to get the signal
    './server.js'
  ],
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'server_built.js'
  },
  module: {
    loaders: [
      // {test: /\.js$/, exclude: /node_modules/, loaders: ['monkey-hot', 'babel-loader'] }, // don't use monkey-hot-loader on the backend for now
      {test: /\.js$/, exclude: /node_modules/, loaders: ['babel-loader'] },
      {test: /\.json$/, loader: 'json'},
    ]
  },
  // "Store/Load compiler state from/to a json file. This will result in persistent ids of modules and chunks. Required, when using Hot Code Replacement between multiple calls to the compiler."
  recordsPath: path.resolve(path.join(__dirname, 'build/webpack_module_cache/IGNORE.webpack.records.json')),
  // "node" Compile for usage in a node.js-like environment (use require to load chunks)
  target: 'node',
  // Necessary to get __dirname to reference files as expected in my node modules
  node: {
    __dirname: false,
    __filename: false
  },
  // don't bundle up dependencies in node_modules, just bundle our own stuff up - see node_modules above
  externals: [
    function(context, request, callback) {
      var pathStart = request.split('/')[0];
      // for now we don't need to check for webpack/hot/signal.js as we're not using hot reloading on the server
      // if (nodeModules.indexOf(pathStart) >= 0 && request != 'webpack/hot/signal.js') {
      if (nodeModules.indexOf(pathStart) >= 0) {
        return callback(null, 'commonjs ' + request);
      };
      callback();
    }
  ],
  plugins: [
    new webpack.IgnorePlugin(/\.(css|less)$/),
    new webpack.BannerPlugin('require("source-map-support").install();',
                             { raw: true, entryOnly: false }),
    // new webpack.HotModuleReplacementPlugin({ quiet: false }) // no hot module reloading on the server for now!
  ]
};

// disable source maps in production

if(process.env.NODE_ENV !== 'production') {
  frontendWebpackConfig.devtool = 'source-map';
  frontendWebpackConfig.debug = true;
  backendWebpackConfig.devtool = 'source-map';
  backendWebpackConfig.debug = true;
}

// tasks

function onBuild(done) {
  return function(err, stats) {
    if(err) {
      console.log('Error', err);
    }
    else {
      console.log(stats.toString());
    }
    if(done) {
      done();
    }
  }
}

gulp.task('frontend-build', function(done) {
  webpack(frontendWebpackConfig).run(onBuild(done));
});

gulp.task('frontend-watch', function() {
  new WebpackDevServer(webpack(frontendWebpackConfig), {
    publicPath: frontendWebpackConfig.output.publicPath,
    hot: true,
    // proxy all requests that are not for our front-end app.js or style.css to the express API server
    // this is useful to prevent issues with cross site scripting, and keeping paths relative
    proxy: {
      '*': 'http://localhost:8080'
    },
    quiet: false,
    noInfo: true,
    stats: { colors: true }
  }).listen(3000, 'localhost', function (err, result) {
    if(err) {
      console.log(err);
    }
    else {
      console.log('Webpack dev server listening at localhost:3000');
    }
  });
});

gulp.task('backend-build', function(done) {
  webpack(backendWebpackConfig).run(onBuild(done));
});

gulp.task('backend-watch', function(done) {
  var firedDone = false;
  webpack(backendWebpackConfig).watch(100, function(err, stats) {
    if(!firedDone) {
      firedDone = true;
      done();
    }
    nodemon.restart();
  });
});

gulp.task('build', ['frontend-build', 'backend-build']);
gulp.task('watch', ['frontend-watch', 'backend-watch']);

// the main task, 'gulp run' gets the whole thing up and running
gulp.task('run', ['backend-watch', 'frontend-watch'], function() {
  nodemon({
    execMap: {
      js: 'node'
    },
    script: path.join(__dirname, 'build/server_built'),
    // don't actually watch the filesystem for backend file changes - this is already being done with webpack().watch()
    ignore: ['*'],
    watch: ['foo/'],
    ext: 'noop'
  }).on('restart', function() {
    // console.log('Patched!');
    console.log('Restarted server!');
  });
});
