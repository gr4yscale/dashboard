require("source-map-support").install();
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _promise = __webpack_require__(2);

	var _promise2 = _interopRequireDefault(_promise);

	var _dotenv = __webpack_require__(3);

	var _dotenv2 = _interopRequireDefault(_dotenv);

	var _todoist = __webpack_require__(4);

	var _todoist2 = _interopRequireDefault(_todoist);

	var _pinboard = __webpack_require__(9);

	var _pinboard2 = _interopRequireDefault(_pinboard);

	var _gcal = __webpack_require__(12);

	var _gcal2 = _interopRequireDefault(_gcal);

	var _evernote = __webpack_require__(15);

	var _evernote2 = _interopRequireDefault(_evernote);

	var _gmail = __webpack_require__(17);

	var _gmail2 = _interopRequireDefault(_gmail);

	var _rss = __webpack_require__(36);

	var _rss2 = _interopRequireDefault(_rss);

	var _pocket = __webpack_require__(39);

	var _pocket2 = _interopRequireDefault(_pocket);

	var _screens = __webpack_require__(19);

	var _screens2 = _interopRequireDefault(_screens);

	var _path = __webpack_require__(23);

	var _path2 = _interopRequireDefault(_path);

	var _express = __webpack_require__(24);

	var _express2 = _interopRequireDefault(_express);

	var _bodyParser = __webpack_require__(25);

	var _bodyParser2 = _interopRequireDefault(_bodyParser);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	_dotenv2.default.config(); // load up environment variables from a .env file (which is gitignored)
	// config
	var env = process.env.NODE_ENV;
	var syncIntervalMins = env == 'production' ? 5 : 0.2;

	// authentication
	var passport = __webpack_require__(26);
	var GoogleStrategy = __webpack_require__(27).OAuth2Strategy;
	var EvernoteStrategy = __webpack_require__(28).Strategy;
	var PocketStrategy = __webpack_require__(40);

	// datasources - FIXME REFACTOR these out soon!


	var todoist = new _todoist2.default();
	var pinboard = new _pinboard2.default();
	var gcal = new _gcal2.default();
	var evernote = new _evernote2.default();
	var gmail = new _gmail2.default();
	var github = new _rss2.default('https://github.com/timeline');
	var creativeai = new _rss2.default('http://www.creativeai.net/feed.xml');
	var hackernews = new _rss2.default('http://hnapp.com/rss?q=score%3E' + 10);
	var vox = new _rss2.default('http://www.vox.com/rss/index.xml');
	var pocket = new _pocket2.default();

	var screens = new _screens2.default(todoist, pinboard, gcal, evernote, gmail, github, creativeai, hackernews, pocket);

	// API server


	var app = (0, _express2.default)();
	var session = __webpack_require__(29);
	app.use(_bodyParser2.default.urlencoded({
	  extended: true
	}));
	app.use(_bodyParser2.default.json());
	app.use(session({ secret: 'yeauhhhhh', resave: true, saveUninitialized: true }));
	app.use(passport.initialize());

	var basePath = '';
	if (env == 'production') {
	  basePath = '/public/';
	} else {
	  basePath = '/../src/static/';
	}

	app.get('/screens', function (req, res) {
	  res.send(screens.screens());
	});

	app.get('/', function (req, res) {
	  res.sendFile(_path2.default.resolve(__dirname + basePath + 'index.html'));
	});

	app.get('/app.js', function (req, res) {
	  res.sendFile(_path2.default.resolve(__dirname + basePath + 'app.js'));
	});

	app.get('/app.js.map', function (req, res) {
	  res.sendFile(_path2.default.resolve(__dirname + basePath + 'app.js.map'));
	});

	app.get('/style.css', function (req, res) {
	  res.sendFile(_path2.default.resolve(__dirname + basePath + 'style.css'));
	});

	app.get('/style.css.map', function (req, res) {
	  res.sendFile(_path2.default.resolve(__dirname + basePath + 'style.css.map'));
	});

	// authentication routes

	app.get('/auth/google', passport.authenticate('google', { session: false }));
	app.get('/auth/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), function (req, res) {
	  gcal.setAccessToken(req.user.accessToken);
	  gmail.setAccessToken(req.user.accessToken);
	  sync();
	  res.redirect('/');
	});

	app.get('/auth/evernote', passport.authenticate('evernote', { session: false }));
	app.get('/auth/evernote/callback', passport.authenticate('evernote', { session: false, failureRedirect: '/login' }), function (req, res) {
	  evernote.setAccessToken(req.user.accessToken);
	  sync();
	  res.redirect('/');
	});

	app.get('/auth/pocket', passport.authenticate('pocket', { session: false }));
	app.get('/auth/pocket/callback', passport.authenticate('pocket', { session: false, failureRedirect: '/login' }), function (req, res) {
	  pocket.setAccessToken(req.user.accessToken);
	  sync();
	  res.redirect('/');
	});

	var server = app.listen(process.env.PORT || 8080, function () {
	  var host = server.address().address;
	  var port = server.address().port;
	  console.log('==> 🌎 Listening at http://%s:%s', host, port);
	});

	function setupPassportStrategies() {
	  var callbackHostName = '';
	  if (env == 'production') {
	    callbackHostName = 'http://dashboard.gr4yscale.com:8080';
	  } else {
	    callbackHostName = 'http://localhost:3000';
	  }

	  passport.use(new GoogleStrategy({
	    clientID: process.env.GOOGLE_CLIENT_ID,
	    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	    callbackURL: callbackHostName + '/auth/google/callback',
	    scope: ['openid', 'email', 'https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/gmail.readonly']
	  }, function (accessToken, refreshToken, profile, done) {
	    profile.accessToken = accessToken;
	    return done(null, profile);
	  }));

	  passport.use(new EvernoteStrategy({
	    requestTokenURL: 'https://www.evernote.com/oauth',
	    accessTokenURL: 'https://www.evernote.com/oauth',
	    userAuthorizationURL: 'https://www.evernote.com/OAuth.action',
	    consumerKey: process.env.EVERNOTE_CONSUMER_KEY,
	    consumerSecret: process.env.EVERNOTE_CONSUMER_SECRET,
	    callbackURL: callbackHostName + '/auth/evernote/callback'
	  }, function (accessToken, tokenSecret, profile, done) {
	    profile.accessToken = accessToken;
	    return done(null, profile);
	  }));

	  passport.use(new PocketStrategy({
	    consumerKey: process.env.POCKET_CONSUMER_KEY,
	    callbackURL: callbackHostName + '/auth/pocket/callback'
	  }, function (username, accessToken, done) {
	    return done(null, {
	      username: username,
	      accessToken: accessToken
	    });
	  }));
	}

	// synchronization
	var io = __webpack_require__(30)(server);
	io.on('connection', function (socket) {
	  console.log('A new client opened a socket connection.');
	});

	function sync() {
	  var p1 = todoist.synchronize();
	  var p2 = pinboard.synchronize();
	  var p3 = gcal.synchronize();
	  var p4 = evernote.synchronize();
	  var p5 = gmail.synchronize();
	  var p6 = github.synchronize();
	  var p7 = creativeai.synchronize();
	  var p8 = hackernews.synchronize();
	  var p9 = pocket.synchronize();

	  _promise2.default.all([p1, p2, p3, p4, p5, p6, p7, p8, p9]).then(function () {
	    console.log('Synced all datasources...');
	    io.sockets.emit('synchronized');
	  }).catch(function (err) {
	    console.log('Error during synchronization!');
	    console.log(err);
	  });
	}

	setInterval(function () {
	  console.log('Syncing datasources...');
	  sync();
	}, syncIntervalMins * 60 * 1000);

	// TOFIX TO FIX TOFIX !!!
	// I know this is bad, but I'm a badboy so no care.
	// Really we should be using domains, but I've got a library raising an error
	// causing a crash that I don't want to modify for now
	process.on('uncaughtException', function (err) {
	  console.log(err);
	});

	setupPassportStrategies();
	sync();

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("babel-runtime/core-js/promise");

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("dotenv");

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _promise = __webpack_require__(2);

	var _promise2 = _interopRequireDefault(_promise);

	var _classCallCheck2 = __webpack_require__(5);

	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

	var _createClass2 = __webpack_require__(6);

	var _createClass3 = _interopRequireDefault(_createClass2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var todoist = __webpack_require__(7);
	var unirest = __webpack_require__(8);

	// Login to todoist and store the latest items

	var DataSourceTodoist = function () {
	  function DataSourceTodoist() {
	    (0, _classCallCheck3.default)(this, DataSourceTodoist);

	    this.items = [];
	    // every so often synchronize?
	  }

	  (0, _createClass3.default)(DataSourceTodoist, [{
	    key: 'synchronize',
	    value: function synchronize() {
	      var _this = this;

	      return new _promise2.default(function (resolve, reject) {
	        todoist.login({ email: process.env.TODOIST_USERNAME, password: process.env.TODOIST_PASS }, function (err, user) {
	          if (err) {
	            console.log(err);
	            reject(err);
	          } else {
	            var apiToken = user.api_token;
	            var requestOptions = {
	              token: apiToken,
	              seq_no: 0,
	              resource_types: '["items"]'
	            };
	            unirest.post('https://todoist.com/API/v6/sync').send(requestOptions).end(function (response) {
	              _this.items = response.body.Items;
	              console.log('* Fetched Todoist data');
	              resolve(response.body.Items);
	            });
	          }
	        });
	      });
	    }
	  }, {
	    key: 'dataForScreenItem',
	    value: function dataForScreenItem(screenItem) {
	      var projectId = screenItem.dataSourceOptions.project_id;
	      var maxItemCount = screenItem.viewOptions.maxItems;

	      return this.items.filter(function (item) {
	        if (item.project_id === 150709951 || item.project_id === 173212883) // inbox and 'mission critical' don't need priority
	          return item.project_id === projectId && item.indent === 1;else return item.project_id === projectId && item.indent === 1 && item.priority > 1;
	      }).sort(function (a, b) {
	        return a.item_order - b.item_order;
	      }).slice(0, maxItemCount).map(function (item) {
	        return {
	          datasource_id: item.id,
	          title: item.content,
	          subtitle: ''
	        };
	      });
	    }
	  }]);
	  return DataSourceTodoist;
	}();

	exports.default = DataSourceTodoist;

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("babel-runtime/helpers/classCallCheck");

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = require("babel-runtime/helpers/createClass");

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = require("node-todoist");

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = require("unirest");

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _values = __webpack_require__(10);

	var _values2 = _interopRequireDefault(_values);

	var _promise = __webpack_require__(2);

	var _promise2 = _interopRequireDefault(_promise);

	var _classCallCheck2 = __webpack_require__(5);

	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

	var _createClass2 = __webpack_require__(6);

	var _createClass3 = _interopRequireDefault(_createClass2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var Pinboard = __webpack_require__(11);

	// const unirest = require('unirest')

	// Login to todoist and store the latest items

	var DataSourcePinboard = function () {
	  function DataSourcePinboard() {
	    (0, _classCallCheck3.default)(this, DataSourcePinboard);

	    this.pinboard = new Pinboard(process.env.PINBOARD_API_KEY);
	    this.data = [];
	  }

	  (0, _createClass3.default)(DataSourcePinboard, [{
	    key: 'synchronize',
	    value: function synchronize() {
	      var _this = this;

	      return new _promise2.default(function (resolve, reject) {
	        _this.pinboard.all({}, function (err, res) {
	          if (err) {
	            reject(err);
	          } else {
	            var data = (0, _values2.default)(res);
	            console.log('* Fetched Pinboard data');
	            _this.data = data;
	            resolve(data);
	          }
	        });
	      });
	    }
	  }, {
	    key: 'formatData',
	    value: function formatData(data) {
	      return data.map(function (item) {
	        return {
	          id: item.href,
	          title: item.description,
	          subtitle: item.url
	        };
	      });
	    }
	  }, {
	    key: 'unreadItems',
	    value: function unreadItems() {
	      var data = this.data.filter(function (item) {
	        return item.toread === 'yes';
	      });
	      return this.formatData(data);
	    }
	  }]);
	  return DataSourcePinboard;
	}();

	exports.default = DataSourcePinboard;

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = require("babel-runtime/core-js/object/values");

/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = require("node-pinboard");

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _promise = __webpack_require__(2);

	var _promise2 = _interopRequireDefault(_promise);

	var _classCallCheck2 = __webpack_require__(5);

	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

	var _createClass2 = __webpack_require__(6);

	var _createClass3 = _interopRequireDefault(_createClass2);

	var _moment = __webpack_require__(13);

	var _moment2 = _interopRequireDefault(_moment);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var gcal = __webpack_require__(14);


	var PRIMARY_CALENDAR_ID = 'gr4yscale@gmail.com';

	var DataSourceGCal = function () {
	  function DataSourceGCal() {
	    (0, _classCallCheck3.default)(this, DataSourceGCal);

	    this.data = [];
	    this.accessToken = '';
	  }

	  (0, _createClass3.default)(DataSourceGCal, [{
	    key: 'setAccessToken',
	    value: function setAccessToken(accessToken) {
	      this.accessToken = accessToken;
	    }
	  }, {
	    key: 'synchronize',
	    value: function synchronize() {
	      var _this = this;

	      if (this.accessToken === '') {
	        console.log('Skipping Google Calendar sync, not authed!');
	        return _promise2.default.resolve({ no: 'data' });
	      } else {
	        return new _promise2.default(function (resolve, reject) {
	          var todayString = (0, _moment2.default)().format();
	          var date1MonthAheadString = (0, _moment2.default)().add(10, 'days').format();
	          gcal(_this.accessToken).events.list(PRIMARY_CALENDAR_ID, { singleEvents: 'true', orderBy: 'startTime', maxResults: 100, timeMin: todayString, timeMax: date1MonthAheadString }, function (err, data) {
	            if (err) {
	              reject(err);
	            } else {
	              _this.data = data.items;
	              console.log('* Fetched Google Calendar data');
	              resolve(data.items);
	            }
	          });
	        });
	      }
	    }
	  }, {
	    key: 'formatData',
	    value: function formatData(data) {
	      return data.map(function (item) {
	        var startDateTime = item.start.dateTime ? item.start.dateTime : item.start.date;
	        return {
	          id: item.id,
	          title: item.summary,
	          subtitle: (0, _moment2.default)(startDateTime).format('MMMM Do YYYY, h:mm:ss a')
	        };
	      });
	    }
	  }, {
	    key: 'eventsThisMonth',
	    value: function eventsThisMonth() {
	      return this.formatData(this.data);
	    }
	  }]);
	  return DataSourceGCal;
	}();

	exports.default = DataSourceGCal;

/***/ },
/* 13 */
/***/ function(module, exports) {

	module.exports = require("moment");

/***/ },
/* 14 */
/***/ function(module, exports) {

	module.exports = require("google-calendar");

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _promise = __webpack_require__(2);

	var _promise2 = _interopRequireDefault(_promise);

	var _classCallCheck2 = __webpack_require__(5);

	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

	var _createClass2 = __webpack_require__(6);

	var _createClass3 = _interopRequireDefault(_createClass2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var Evernote = __webpack_require__(16).Evernote;
	var ENML = __webpack_require__(37);

	var DataSourceEvernote = function () {
	  function DataSourceEvernote() {
	    (0, _classCallCheck3.default)(this, DataSourceEvernote);

	    this.accessToken = '';
	    this.data = {
	      scratchpadNoteContent: ''
	    };
	  }

	  (0, _createClass3.default)(DataSourceEvernote, [{
	    key: 'setAccessToken',
	    value: function setAccessToken(accessToken) {
	      this.accessToken = accessToken;
	    }

	    // TOFIX: give this datasource a list of note ids, and make an accessor
	    // for noteItems by passing in the evernote note guid

	  }, {
	    key: 'synchronize',
	    value: function synchronize() {
	      var _this = this;

	      console.log('Syncing evernote....');
	      return new _promise2.default(function (resolve, reject) {
	        _this.client = new Evernote.Client({ token: _this.accessToken, sandbox: false });
	        _this.noteStore = _this.client.getNoteStore();

	        // for now I just care about a few specific notes from evernote, this datasource will just provide convenience to their content
	        _this.noteStore.getNote(_this.accessToken, '79467e95-4a67-4ce2-9fb8-6b6a6f4e70d3', true, false, false, false, function (err, note) {
	          if (err) {
	            console.log('Evernote datasource encountered an error');
	            console.log(err);
	          } else {
	            try {
	              var plainTextNote = ENML.PlainTextOfENML(note.content);
	              _this.data['scratchpadNoteContent'] = plainTextNote.split('\n').reverse();
	              console.log('* Fetched Evernote data');
	              resolve(_this.data);
	            } catch (err) {
	              console.log('* FAILED fetching Evernote data');
	              reject(err);
	            }
	          }
	        });
	      });
	    }
	  }, {
	    key: 'scratchPadNote',
	    value: function scratchPadNote(screenItem) {
	      if (!this.data['scratchpadNoteContent']) return;

	      var maxItemCount = screenItem.viewOptions.maxItems;

	      return this.data['scratchpadNoteContent'].slice(0, maxItemCount).map(function (line) {
	        return {
	          datasource_id: 'yo',
	          title: line,
	          subtitle: ''
	        };
	      });
	    }
	  }]);
	  return DataSourceEvernote;
	}();

	exports.default = DataSourceEvernote;

/***/ },
/* 16 */
/***/ function(module, exports) {

	module.exports = require("evernote");

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _promise = __webpack_require__(2);

	var _promise2 = _interopRequireDefault(_promise);

	var _classCallCheck2 = __webpack_require__(5);

	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

	var _createClass2 = __webpack_require__(6);

	var _createClass3 = _interopRequireDefault(_createClass2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var Gmail = __webpack_require__(18);

	var DataSourceGmail = function () {
	  function DataSourceGmail() {
	    (0, _classCallCheck3.default)(this, DataSourceGmail);

	    this.accessToken = '';
	    this.data = {
	      starredMessages: []
	    };
	  }

	  (0, _createClass3.default)(DataSourceGmail, [{
	    key: 'setAccessToken',
	    value: function setAccessToken(accessToken) {
	      this.accessToken = accessToken;
	    }
	  }, {
	    key: 'synchronize',
	    value: function synchronize() {
	      var _this = this;

	      console.log('Syncing gmail....');
	      this.data['starredMessages'] = [];
	      return new _promise2.default(function (resolve, reject) {

	        _this.gmail = new Gmail(_this.accessToken);
	        _this.messagesStream = _this.gmail.messages('label:starred', { format: 'metadata', max: 25 });

	        _this.messagesStream.on('data', function (data) {
	          var sanitizedData = {
	            datasource_id: data.id,
	            title: data.snippet,
	            subtitle: ''
	          };
	          _this.data.starredMessages.push(sanitizedData);
	        });
	        // TOFIX: this is a hack. messages are streamed in so Promises (like the rest of the datasources use) are awkward here
	        resolve(_this.data);
	      });
	    }
	  }, {
	    key: 'starredMessages',
	    value: function starredMessages() {
	      return this.data.starredMessages;
	    }
	  }]);
	  return DataSourceGmail;
	}();

	exports.default = DataSourceGmail;

/***/ },
/* 18 */
/***/ function(module, exports) {

	module.exports = require("node-gmail-api");

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _assign = __webpack_require__(20);

	var _assign2 = _interopRequireDefault(_assign);

	var _getIterator2 = __webpack_require__(21);

	var _getIterator3 = _interopRequireDefault(_getIterator2);

	var _classCallCheck2 = __webpack_require__(5);

	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

	var _createClass2 = __webpack_require__(6);

	var _createClass3 = _interopRequireDefault(_createClass2);

	var _screens = __webpack_require__(22);

	var _screens2 = _interopRequireDefault(_screens);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var Screens = function () {
	  // FIXME: beauuuuutiful - REFACTOR

	  function Screens(todoist, pinboard, gcal, evernote, gmail, github, creativeai, hackernews, pocket) {
	    (0, _classCallCheck3.default)(this, Screens);

	    this.todoist = todoist;
	    this.pinboard = pinboard;
	    this.gcal = gcal;
	    this.evernote = evernote;
	    this.gmail = gmail;
	    this.github = github;
	    this.creativeai = creativeai;
	    this.hackernews = hackernews;
	    this.pocket = pocket;
	  }

	  (0, _createClass3.default)(Screens, [{
	    key: 'screens',
	    value: function screens() {
	      var screenItems = [];
	      var _iteratorNormalCompletion = true;
	      var _didIteratorError = false;
	      var _iteratorError = undefined;

	      try {
	        for (var _iterator = (0, _getIterator3.default)(_screens2.default), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	          var screenItem = _step.value;

	          // FIXME: we're mutating screenItem here and adding it to an array
	          switch (screenItem.type) {
	            // handle grid screens
	            case 'grid':
	              var gridScreenItems = [];
	              var _iteratorNormalCompletion2 = true;
	              var _didIteratorError2 = false;
	              var _iteratorError2 = undefined;

	              try {
	                for (var _iterator2 = (0, _getIterator3.default)(screenItem.items), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	                  var gridScreenItem = _step2.value;

	                  var _newData = this.dataForItem(gridScreenItem);
	                  var newGridScreenItem = (0, _assign2.default)({}, gridScreenItem, _newData);
	                  gridScreenItems.push(newGridScreenItem);
	                }
	              } catch (err) {
	                _didIteratorError2 = true;
	                _iteratorError2 = err;
	              } finally {
	                try {
	                  if (!_iteratorNormalCompletion2 && _iterator2.return) {
	                    _iterator2.return();
	                  }
	                } finally {
	                  if (_didIteratorError2) {
	                    throw _iteratorError2;
	                  }
	                }
	              }

	              screenItem.items = gridScreenItems;
	              break;
	            case 'list':
	            case 'singleItem':
	              // for now singleItems get data in an items array to select a single item from
	              var newData = this.dataForListItem(screenItem);
	              screenItem = (0, _assign2.default)({}, screenItem, newData);
	              break;
	          }
	          screenItems.push(screenItem);
	        }
	      } catch (err) {
	        _didIteratorError = true;
	        _iteratorError = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion && _iterator.return) {
	            _iterator.return();
	          }
	        } finally {
	          if (_didIteratorError) {
	            throw _iteratorError;
	          }
	        }
	      }

	      return screenItems;
	    }

	    // FIXME: very obviously in need of a refactor below... no care for now...

	  }, {
	    key: 'dataForItem',
	    value: function dataForItem(item) {
	      // console.log(item)
	      var newData = { data: '' };
	      switch (item.dataSource) {
	        case 'todoist':
	          newData['data'] = this.todoist.dataForScreenItem(item);
	          break;
	        case 'pinboard':
	          newData['data'] = this.pinboard.unreadItems();
	          break;
	        case 'gcal':
	          newData['data'] = this.gcal.eventsThisMonth();
	          break;
	        case 'gmail':
	          newData['data'] = this.gmail.starredMessages();
	          break;
	        case 'github':
	          newData['data'] = this.github.items();
	          break;
	        case 'creativeai':
	          newData['data'] = this.creativeai.items();
	          break;
	        case 'hackernews':
	          newData['data'] = this.hackernews.items();
	          break;
	        case 'evernote':
	          newData['data'] = this.evernote.scratchPadNote(item);
	          break;
	        case 'pocket':
	          newData['data'] = this.pocket.favoritedItems();
	          break;
	      }
	      return newData;
	    }
	  }, {
	    key: 'dataForListItem',
	    value: function dataForListItem(item) {
	      // console.log(item)
	      var newData = { items: [] };
	      switch (item.dataSource) {
	        case 'todoist':
	          newData['items'] = this.todoist.dataForScreenItem(item);
	          break;
	        case 'pinboard':
	          newData['items'] = this.pinboard.unreadItems();
	          break;
	        case 'gcal':
	          newData['items'] = this.gcal.eventsThisMonth();
	          break;
	        case 'gmail':
	          newData['items'] = this.gmail.starredMessages();
	          break;
	        case 'github':
	          newData['items'] = this.github.items();
	          break;
	        case 'creativeai':
	          {
	            console.log(this.creativeai.items());
	            newData['items'] = this.creativeai.items();
	            break;
	          }
	        case 'hackernews':
	          newData['items'] = this.hackernews.items();
	          break;
	        case 'evernote':
	          newData['items'] = this.evernote.scratchPadNote(item);
	          break;
	        case 'pocket':
	          newData['items'] = this.pocket.favoritedItems();
	          break;
	      }
	      return newData;
	    }
	  }]);
	  return Screens;
	}();

	exports.default = Screens;

/***/ },
/* 20 */
/***/ function(module, exports) {

	module.exports = require("babel-runtime/core-js/object/assign");

/***/ },
/* 21 */
/***/ function(module, exports) {

	module.exports = require("babel-runtime/core-js/get-iterator");

/***/ },
/* 22 */
/***/ function(module, exports) {

	module.exports = [
		{
			"index": 0,
			"description": "Main screen",
			"type": "grid",
			"items": [
				{
					"index": 0,
					"title": "Mission Critical",
					"dataSource": "todoist",
					"dataSourceOptions": {
						"project_id": 173212883
					},
					"gridScreenView": "list",
					"viewOptions": {
						"maxItems": 10
					},
					"sort_order": 0
				},
				{
					"index": 1,
					"title": "Inbox",
					"dataSource": "todoist",
					"dataSourceOptions": {
						"project_id": 150709951
					},
					"gridScreenView": "list",
					"viewOptions": {
						"maxItems": 10
					},
					"sort_order": 0
				},
				{
					"index": 2,
					"title": "Scratchpad",
					"dataSource": "evernote",
					"dataSourceOptions": {},
					"gridScreenView": "list",
					"viewOptions": {
						"maxItems": 10
					},
					"sort_order": 0
				},
				{
					"index": 3,
					"title": "Errands / Shopping",
					"dataSource": "todoist",
					"dataSourceOptions": {
						"project_id": 150709955
					},
					"gridScreenView": "list",
					"viewOptions": {
						"maxItems": 10
					},
					"sort_order": 0
				},
				{
					"index": 4,
					"title": "Correspondence",
					"dataSource": "todoist",
					"dataSourceOptions": {
						"project_id": 158490814
					},
					"gridScreenView": "list",
					"viewOptions": {
						"maxItems": 10
					},
					"sort_order": 0
				},
				{
					"index": 5,
					"title": "Routine Reinforcements",
					"dataSource": "todoist",
					"dataSourceOptions": {
						"project_id": 150714182
					},
					"gridScreenView": "list",
					"viewOptions": {
						"maxItems": 10
					},
					"sort_order": 0
				}
			]
		},
		{
			"index": 1,
			"description": "Secondary",
			"type": "grid",
			"items": [
				{
					"index": 0,
					"description": "Calendar",
					"title": "Calendar",
					"gridScreenView": "list",
					"dataSource": "gcal",
					"dataSourceOptions": {},
					"viewOptions": {
						"maxItems": 15
					}
				},
				{
					"index": 1,
					"description": "Starred Emails",
					"title": "Starred Emails",
					"gridScreenView": "list",
					"dataSource": "gmail",
					"dataSourceOptions": {},
					"viewOptions": {
						"maxItems": 15
					}
				},
				{
					"index": 2,
					"description": "Pocket Favorites",
					"title": "Pocket Favorites",
					"gridScreenView": "list",
					"dataSource": "pocket",
					"dataSourceOptions": {},
					"viewOptions": {
						"maxItems": 15
					}
				}
			]
		},
		{
			"index": 2,
			"description": "Three",
			"title": "Three",
			"type": "grid",
			"items": [
				{
					"index": 0,
					"description": "CreativeAI",
					"title": "CreativeAI",
					"gridScreenView": "list",
					"dataSource": "creativeai",
					"dataSourceOptions": {},
					"viewOptions": {
						"maxItems": 10
					}
				},
				{
					"index": 1,
					"description": "Hacker News",
					"title": "Hacker News",
					"gridScreenView": "list",
					"dataSource": "hackernews",
					"dataSourceOptions": {},
					"viewOptions": {
						"maxItems": 14
					}
				},
				{
					"index": 2,
					"description": "Github Public Timeline",
					"title": "Github Public Timeline",
					"gridScreenView": "list",
					"dataSource": "github",
					"dataSourceOptions": {},
					"viewOptions": {
						"maxItems": 20
					}
				}
			]
		},
		{
			"index": 3,
			"description": "Four",
			"title": "Four",
			"type": "grid",
			"items": [
				{
					"index": 1,
					"title": "Projects",
					"dataSource": "todoist",
					"dataSourceOptions": {
						"project_id": 150718495
					},
					"gridScreenView": "list",
					"viewOptions": {
						"maxItems": 15
					},
					"sort_order": 0
				},
				{
					"index": 2,
					"title": "Learning",
					"dataSource": "todoist",
					"dataSourceOptions": {
						"project_id": 150710059
					},
					"gridScreenView": "list",
					"viewOptions": {
						"maxItems": 15
					},
					"sort_order": 0
				}
			]
		}
	];

/***/ },
/* 23 */
/***/ function(module, exports) {

	module.exports = require("path");

/***/ },
/* 24 */
/***/ function(module, exports) {

	module.exports = require("express");

/***/ },
/* 25 */
/***/ function(module, exports) {

	module.exports = require("body-parser");

/***/ },
/* 26 */
/***/ function(module, exports) {

	module.exports = require("passport");

/***/ },
/* 27 */
/***/ function(module, exports) {

	module.exports = require("passport-google-oauth");

/***/ },
/* 28 */
/***/ function(module, exports) {

	module.exports = require("passport-evernote");

/***/ },
/* 29 */
/***/ function(module, exports) {

	module.exports = require("express-session");

/***/ },
/* 30 */
/***/ function(module, exports) {

	module.exports = require("socket.io");

/***/ },
/* 31 */,
/* 32 */,
/* 33 */,
/* 34 */
/***/ function(module, exports) {

	module.exports = require("feedparser");

/***/ },
/* 35 */
/***/ function(module, exports) {

	module.exports = require("request");

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _promise = __webpack_require__(2);

	var _promise2 = _interopRequireDefault(_promise);

	var _classCallCheck2 = __webpack_require__(5);

	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

	var _createClass2 = __webpack_require__(6);

	var _createClass3 = _interopRequireDefault(_createClass2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var FeedParser = __webpack_require__(34);
	// unfortunately we must use request instead of promises-based axios because FeedParser wants a stream
	var request = __webpack_require__(35);

	var DataSourceRSS = function () {
	  function DataSourceRSS(url, transform) {
	    (0, _classCallCheck3.default)(this, DataSourceRSS);

	    this.url = url;
	    this.data = [];
	    if (transform) {
	      this.transform = transform;
	    } else {
	      this.transform = function (data) {
	        return {
	          title: data.title,
	          subtitle: '',
	          datasource_id: data.guid,
	          titleUrl: data.link,
	          description: data.description
	        };
	      };
	    }
	  }

	  (0, _createClass3.default)(DataSourceRSS, [{
	    key: 'synchronize',
	    value: function synchronize() {
	      var _this = this;

	      console.log('Syncing RSS feed: RSS feed: ' + this.url);
	      return new _promise2.default(function (resolve, reject) {
	        var feedparser = new FeedParser();
	        _this.data = [];

	        var feedParsingComplete = function feedParsingComplete(err) {
	          if (err) {
	            console.log('Error parsing RSS feed: ' + _this.url);
	            console.log(err);
	            reject(err);
	          } else {
	            resolve();
	          }
	        };

	        // get a reference to data before 'this' scope is changed with ES5 style syntax
	        // Using ES5 function syntax on the below callbacks to capture a reference to the feedparser stream
	        var data = _this.data;

	        // make a stream requesting feed XML and pipe it to FeedParser
	        request.get(_this.url).on('error', feedParsingComplete).on('response', function (res) {
	          var stream = this; // request response callback is a stream, feedparser wants a stream
	          if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));
	          stream.pipe(feedparser);
	        });

	        // hook up stream callbacks
	        feedparser.on('error', feedParsingComplete);
	        feedparser.on('end', feedParsingComplete);

	        feedparser.on('readable', function () {
	          var stream = this;
	          var meta = this.meta;
	          var item = void 0;

	          while (item = stream.read()) {
	            data.push(item);
	          }
	        });
	      });
	    }
	  }, {
	    key: 'items',
	    value: function items() {
	      // transform the data on demand - we could transform it on the end callback of the stream so that it is already ready,
	      // but then there is potential for a race condition without keeping track of "isStreaming" state,
	      // which I could have done in the amount of time it took to type this comment. DEAL WITH IT, this is plenty fast enough
	      return this.data.map(this.transform);
	    }
	  }]);
	  return DataSourceRSS;
	}();

	exports.default = DataSourceRSS;

/***/ },
/* 37 */
/***/ function(module, exports) {

	module.exports = require("enml-js");

/***/ },
/* 38 */,
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _promise = __webpack_require__(2);

	var _promise2 = _interopRequireDefault(_promise);

	var _classCallCheck2 = __webpack_require__(5);

	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

	var _createClass2 = __webpack_require__(6);

	var _createClass3 = _interopRequireDefault(_createClass2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var unirest = __webpack_require__(8);

	var DataSourcePocket = function () {
	  function DataSourcePocket() {
	    (0, _classCallCheck3.default)(this, DataSourcePocket);

	    this.data = [];
	    this.accessToken = '';
	  }

	  (0, _createClass3.default)(DataSourcePocket, [{
	    key: 'setAccessToken',
	    value: function setAccessToken(accessToken) {
	      this.accessToken = accessToken;
	    }

	    // get favorite items only for now

	  }, {
	    key: 'synchronize',
	    value: function synchronize() {
	      var _this = this;

	      console.log('Syncing pocket');
	      return new _promise2.default(function (resolve, reject) {
	        var requestOptions = {
	          consumer_key: process.env.POCKET_CONSUMER_KEY,
	          access_token: _this.accessToken,
	          favorite: 1
	        };
	        unirest.post('https://getpocket.com/v3/get').send(requestOptions).end(function (response) {
	          _this.data = [];
	          var data = response.body.list;
	          if (data) {
	            for (var key in data) {
	              if (data.hasOwnProperty(key)) {
	                _this.data.push(data[key]);
	              }
	            }
	          }
	          resolve(_this.data);
	        });
	      });
	    }
	  }, {
	    key: 'formatData',
	    value: function formatData(data) {
	      return data.map(function (item) {
	        return {
	          id: item.item_id,
	          title: item.resolved_title,
	          titleUrl: item.resolved_url,
	          subtitle: item.resolved_url
	        };
	      });
	    }
	  }, {
	    key: 'favoritedItems',
	    value: function favoritedItems() {
	      if (this.data) {
	        return this.formatData(this.data);
	      }
	    }
	  }]);
	  return DataSourcePocket;
	}();

	exports.default = DataSourcePocket;

/***/ },
/* 40 */
/***/ function(module, exports) {

	module.exports = require("passport-pocket");

/***/ }
/******/ ]);