// config
import dotenv from 'dotenv'
dotenv.config() // load up environment variables from a .env file (which is gitignored)
const env = process.env.NODE_ENV
let syncIntervalMins = (env == 'production') ? 5 : 0.5

// authentication
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
const EvernoteStrategy = require('passport-evernote').Strategy
const PocketStrategy = require('passport-pocket')

// datasources - FIXME REFACTOR these out soon!
import DataSourceTodoist from './src/datasources/todoist'
import DataSourcePinboard from './src/datasources/pinboard'
import DataSourceGCal from './src/datasources/gcal'
import DataSourceEvernote from './src/datasources/evernote'
import DataSourceGmail from './src/datasources/gmail'
import DataSourceRSS from './src/datasources/rss'
import DataSourcePocket from './src/datasources/pocket'

const todoist = new DataSourceTodoist()
const pinboard = new DataSourcePinboard()
const gcal = new DataSourceGCal()
const evernote = new DataSourceEvernote()
const gmail = new DataSourceGmail()
const github = new DataSourceRSS('https://github.com/timeline')
const creativeai = new DataSourceRSS('http://www.creativeai.net/feed.xml')
const hackernews = new DataSourceRSS('http://hnapp.com/rss?q=score%3E' + 10)
const vox = new DataSourceRSS('http://www.vox.com/rss/index.xml')
const pocket = new DataSourcePocket()

import Screens from './src/models/screens'
const screens = new Screens(todoist, pinboard, gcal, evernote, gmail, github, creativeai, hackernews, pocket)

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
    gmail.setAccessToken(req.user.accessToken)
    sync()
    res.redirect('/')
  }
)

app.get('/auth/evernote', passport.authenticate('evernote', { session: false } ))
app.get('/auth/evernote/callback',
  passport.authenticate('evernote', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    evernote.setAccessToken(req.user.accessToken)
    sync()
    res.redirect('/')
  }
)

app.get('/auth/pocket', passport.authenticate('pocket', { session: false } ))
app.get('/auth/pocket/callback',
  passport.authenticate('pocket', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    pocket.setAccessToken(req.user.accessToken)
    sync()
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
    scope: ['openid', 'email', 'https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/gmail.readonly']
  },
  (accessToken, refreshToken, profile, done) => {
    profile.accessToken = accessToken
    return done(null, profile)
  }))

  passport.use(new EvernoteStrategy({
    requestTokenURL: 'https://www.evernote.com/oauth',
    accessTokenURL: 'https://www.evernote.com/oauth',
    userAuthorizationURL: 'https://www.evernote.com/OAuth.action',
    consumerKey: process.env.EVERNOTE_CONSUMER_KEY,
    consumerSecret: process.env.EVERNOTE_CONSUMER_SECRET,
    callbackURL: callbackHostName + '/auth/evernote/callback'
  },
  (accessToken, tokenSecret, profile, done) => {
    profile.accessToken = accessToken
    return done(null, profile)
  }))

  passport.use(new PocketStrategy({
    consumerKey: process.env.POCKET_CONSUMER_KEY,
    callbackURL: callbackHostName + '/auth/pocket/callback'
  },
  (username, accessToken, done) => {
      return done(null, {
          username : username,
          accessToken : accessToken
      })
    })
  )
}

// synchronization
const io = require('socket.io')(server)
io.on('connection', (socket) => {
  console.log('A new client opened a socket connection.')
})

function sync() {
  let p1 = todoist.synchronize()
  let p2 = pinboard.synchronize()
  let p3 = gcal.synchronize()
  let p4 = evernote.synchronize()
  let p5 = gmail.synchronize()
  let p6 = github.synchronize()
  let p7 = creativeai.synchronize()
  let p8 = hackernews.synchronize()
  let p9 = pocket.synchronize()

  Promise.all([p1, p2, p3, p4, p5, p6, p7, p8, p9])
  .then(() => {
    console.log('Synced all datasources...')
    io.sockets.emit('synchronized')
  })
  .catch((err) => {
    console.log('Error during synchronization!')
    console.log(err)
  })
}

setInterval(() => {
  console.log('Syncing datasources...')
  sync()
}, syncIntervalMins * 60 * 1000)

// TOFIX TO FIX TOFIX !!!
// I know this is bad, but I'm a badboy so no care.
// Really we should be using domains, but I've got a library raising an error
// causing a crash that I don't want to modify for now
process.on('uncaughtException', (err) => {
  console.log(err);
})

setupPassportStrategies()
sync()
