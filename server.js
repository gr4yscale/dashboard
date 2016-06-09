// config
import dotenv from 'dotenv'
dotenv.config() // load up environment variables from a .env file (which is gitignored)
const env = process.env.NODE_ENV
let syncIntervalMins = (env == 'production') ? 5 : 0.2

// authentication
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
const EvernoteStrategy = require('passport-evernote').Strategy

// datasources
import DataSourceGCal from './src/datasources/gcal'
import DataSourceTodoist from './src/datasources/todoist'
import DataSourcePinboard from './src/datasources/pinboard'
import DataSourceEvernote from './src/datasources/evernote'

const todoist = new DataSourceTodoist()
const pinboard = new DataSourcePinboard()
const gcal = new DataSourceGCal()
const evernote = new DataSourceEvernote()

import Screens from './src/models/screens'
const screens = new Screens(todoist, pinboard, gcal)

// API server
import path from 'path'
import express from 'express'
import bodyParser from 'body-parser'

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
  res.send(screens.screens())
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

// authentication routes

app.get('/auth/google', passport.authenticate('google', { session: false } ))
app.get('/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    gcal.setAccessToken(req.user.accessToken)
    gcal.synchronize()
    res.redirect('/')
  }
)

app.get('/auth/evernote', passport.authenticate('evernote', { session: false } ))
app.get('/auth/evernote/callback',
  passport.authenticate('evernote', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    evernote.setAccessToken(req.user.accessToken)
    res.redirect('/')
  }
)

const server = app.listen(process.env.PORT || 8080, () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log('==> 🌎 Listening at http://%s:%s', host, port);
})

function setupPassportStrategies() {
  let callbackHostName = ''
  if (env == 'production') {
    callbackHostName = 'http://dashboard.gr4yscale.com:8080'
  } else {
    callbackHostName = 'http://localhost:3000'
  }

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: callbackHostName + '/auth/google/callback',
    scope: ['openid', 'email', 'https://www.googleapis.com/auth/calendar']
  },
  (accessToken, refreshToken, profile, done) => {
    profile.accessToken = accessToken
    return done(null, profile)
  }))

  passport.use(new EvernoteStrategy({
    requestTokenURL: 'https://sandbox.evernote.com/oauth',
    accessTokenURL: 'https://sandbox.evernote.com/oauth',
    userAuthorizationURL: 'https://sandbox.evernote.com/OAuth.action',
    consumerKey: process.env.EVERNOTE_CONSUMER_KEY,
    consumerSecret: process.env.EVERNOTE_CONSUMER_SECRET,
    callbackURL: callbackHostName + '/auth/evernote/callback'
  },
  (accessToken, tokenSecret, profile, done) => {
    profile.accessToken = accessToken
    return done(null, profile)
  }))
}

// synchronization
const io = require('socket.io')(server)
io.on('connection', (socket) => {
  console.log('a socket connection was created')
  socket.emit('an event', { some: 'data' })
})

function sync() {
  let p1 = todoist.synchronize()
  let p2 = pinboard.synchronize()
  let p3 = gcal.synchronize()
  let p4 = evernote.synchronize()

  Promise.all([p1, p2, p3, p4])
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
}, syncIntervalMins * 60 * 1000)

setupPassportStrategies()
sync()
