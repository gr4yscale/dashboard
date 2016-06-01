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
app.use(passport.initialize());

app.get('/screens', function(req, res) {
  // if(!req.session.access_token) return res.redirect('/auth');
  // var accessToken = req.session.access_token;
  res.send(screens.screenOne())
})

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname + '/../src/static//index.html'));
});

app.get('/authGoogle', passport.authenticate('google', { session: false } ))

app.get('/auth/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), (req, res) => {
  gcal.setAccessToken(req.user.accessToken)
  gcal.synchronize()
  res.redirect('/')
})

const server = app.listen(process.env.PORT || 8080, 'localhost', () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log('==> 🌎 Listening at http://%s:%s', host, port);
});

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

todoist.synchronize()
pinboard.synchronize()
