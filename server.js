import dotenv from 'dotenv'
import path from 'path'
import express from 'express'
import bodyParser from 'body-parser'

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
const passport = require('passport')

import Screens from './src/models/screens'
import DataSourceGCal from './src/datasources/gcal'
import DataSourceTodoist from './src/datasources/todoist'
import DataSourcePinboard from './src/datasources/pinboard'

dotenv.config() // load up environment variables from a .env file (which is gitignored)
const env = process.env.NODE_ENV
const todoist = new DataSourceTodoist()
const pinboard = new DataSourcePinboard()
const gcal = new DataSourceGCal()
// TOFIX: refactor this as a ScreensModel, let it contain the screen config json as well
const screens = new Screens(todoist, pinboard, gcal)

// API server
const app = express()
const session = require('express-session')
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())
app.use(session({ secret: 'yeauhhhhh', resave: true, saveUninitialized: true}))
app.use(passport.initialize())

let basePath = ''
if (env == 'production') {
  basePath = '/public/'
} else {
  basePath = '/../src/static/';
}

app.get('/screens', function(req, res) {
  res.send(screens.screenOne())
})

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname + basePath + 'index.html'))
})

app.get('/app.js', (req, res) => {
  res.sendFile(path.resolve(__dirname + basePath + 'app.js'));
})

app.get('/app.js.map', (req, res) => {
  res.sendFile(path.resolve(__dirname + basePath + 'app.js.map'));
})

app.get('/style.css', (req, res) => {
  res.sendFile(path.resolve(__dirname + basePath + 'style.css'));
})

app.get('/style.css.map', (req, res) => {
  res.sendFile(path.resolve(__dirname + basePath + 'style.css.map'));
})

app.get('/authGoogle', passport.authenticate('google', { session: false } ))

app.get('/auth/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), (req, res) => {
  gcal.setAccessToken(req.user.accessToken)
  gcal.synchronize()
  res.redirect('/')
})

const server = app.listen(process.env.PORT || 8080, () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log('==> 🌎 Listening at http://%s:%s', host, port);
})

// Google Calendar Authentication - refactor later
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // TOFIX: conditionally set the callback URL hostname based on environment
    callbackURL: 'http://localhost:3000/auth/callback',
    scope: ['openid', 'email', 'https://www.googleapis.com/auth/calendar']
  },
  (accessToken, refreshToken, profile, done) => {
    profile.accessToken = accessToken
    return done(null, profile)
  }
))

// synchronization
const io = require('socket.io')(server)
io.on('connection', (socket) => {
  console.log('a socket connection was created')
  socket.emit('an event', { some: 'data' })
})

// let httpProxy = require('http-proxy')
// let proxy = httpProxy.createServer(8080, 'localhost').listen(8081)

function sync() {
  let p1 = todoist.synchronize()
  let p2 = pinboard.synchronize()
  let p3 = gcal.synchronize()
  Promise.all([p1, p2, p3])
  .then(() => {
    console.log('Synced all datasources...')
    io.sockets.emit('synchronized')
  })
  .catch((err) => {
    console.log('error!')
    console.log(err)
  })
}

setInterval(() => {
  console.log('Syncing datasources...')
  sync()
}, 60 * 0.25 * 1000) // every 15 mins

sync()
