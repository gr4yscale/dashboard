import path from 'path';
import express from 'express';
const app = express();
import dotenv from 'dotenv'

import Screens from './src/models/screens'
const screens = new Screens()

// transform data from todoist items list to something more suitable for react components
dotenv.config()

app.get('/screens', function(req, res) {
  res.send(screens.screenOne())
})

// Serve index page
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname + '/../src/static//index.html'));
});

/*************************************************************
 *
 * API / Express server
 *
 *************************************************************/

const server = app.listen(process.env.PORT || 8080, 'localhost', () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log('==> 🌎 Listening at http://%s:%s', host, port);
});
