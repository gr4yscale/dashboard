
import express from 'express';
const app = express();

import Screens from './src/models/screens'
const screens = new Screens()

// transform data from todoist items list to something more suitable for react components

app.get('/screens', function(req, res) {

  // Website you wish to allow to connect
  // res.setHeader('Access-Control-Allow-Origin', 'http://http://localhost:8082');
  //
  // // Request methods you wish to allow
  // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  //
  // // Request headers you wish to allow
  // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  //
  // // Set to true if you need the website to include cookies in the requests sent
  // // to the API (e.g. in case you use sessions)
  // res.setHeader('Access-Control-Allow-Credentials', true);

  debugger;

  res.send(screens.screenOne())
})

// For now we we redirect requests to our express server for app.js and style.css
// To the Webpack dev server running on port 9090. The other option is to configure
// webpack-dev-server to be a proxy for all requests. See the "proxy" section on:
// https://webpack.github.io/docs/webpack-dev-server.html

// Serve application file depending on environment
app.get('/app.js', (req, res) => {
  if (process.env.PRODUCTION) {
    res.sendFile(__dirname + '/public/app.js');
  } else {
    res.redirect('//localhost:9090/public/app.js');
  }
});

// Serve aggregate stylesheet depending on environment
app.get('/style.css', (req, res) => {
  if (process.env.PRODUCTION) {
    res.sendFile(__dirname + '/public/style.css');
  } else {
    res.redirect('//localhost:9090/public/style.css');
  }
});

// Serve index page
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

/*************************************************************
 *
 * Webpack Dev Server
 *
 *************************************************************/

if (!process.env.PRODUCTION) {
  const webpack = require('webpack');
  const WebpackDevServer = require('webpack-dev-server');
  const config = require('./webpack.local.config');

  new WebpackDevServer(webpack(config), {
    publicPath: config.output.publicPath,
    hot: true,
    noInfo: true,
    stats: { colors: true },
    historyApiFallback: true
  }).listen(9090, 'localhost', (err, result) => {
    if (err) {
      console.log(err);
    }
  });
}

/*************************************************************
 *
 * API / Express server
 *
 *************************************************************/

const server = app.listen(process.env.PORT || 8082, 'localhost', () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log('==> 🌎 Listening at http://%s:%s', host, port);
});
