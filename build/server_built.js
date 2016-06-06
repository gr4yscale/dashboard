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

	var _promise = __webpack_require__(15);

	var _promise2 = _interopRequireDefault(_promise);

	var _dotenv = __webpack_require__(26);

	var _dotenv2 = _interopRequireDefault(_dotenv);

	var _path = __webpack_require__(2);

	var _path2 = _interopRequireDefault(_path);

	var _express = __webpack_require__(3);

	var _express2 = _interopRequireDefault(_express);

	var _bodyParser = __webpack_require__(22);

	var _bodyParser2 = _interopRequireDefault(_bodyParser);

	var _screens = __webpack_require__(4);

	var _screens2 = _interopRequireDefault(_screens);

	var _gcal = __webpack_require__(18);

	var _gcal2 = _interopRequireDefault(_gcal);

	var _todoist = __webpack_require__(9);

	var _todoist2 = _interopRequireDefault(_todoist);

	var _pinboard = __webpack_require__(13);

	var _pinboard2 = _interopRequireDefault(_pinboard);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var GoogleStrategy = __webpack_require__(20).OAuth2Strategy;
	var passport = __webpack_require__(21);

	_dotenv2.default.config(); // load up environment variables from a .env file (which is gitignored)
	var env = process.env.NODE_ENV;
	var syncIntervalMins = env == 'production' ? 5 : 1;

	var todoist = new _todoist2.default();
	var pinboard = new _pinboard2.default();
	var gcal = new _gcal2.default();
	// TOFIX: refactor this as a ScreensModel, let it contain the screen config json as well
	var screens = new _screens2.default(todoist, pinboard, gcal);

	// API server
	var app = (0, _express2.default)();
	var session = __webpack_require__(24);
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

	app.get('/authGoogle', passport.authenticate('google', { session: false }));

	app.get('/auth/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), function (req, res) {
	  gcal.setAccessToken(req.user.accessToken);
	  gcal.synchronize();
	  res.redirect('/');
	});

	var server = app.listen(process.env.PORT || 8080, function () {
	  var host = server.address().address;
	  var port = server.address().port;
	  console.log('==> 🌎 Listening at http://%s:%s', host, port);
	});

	// Google Calendar Authentication - refactor later

	var callbackHostName = '';
	if (env == 'production') {
	  callbackHostName = 'http://dashboard.gr4yscale.com:8080';
	} else {
	  callbackHostName = 'http://localhost:3000';
	}

	passport.use(new GoogleStrategy({
	  clientID: process.env.GOOGLE_CLIENT_ID,
	  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	  // TOFIX: conditionally set the callback URL hostname based on environment
	  callbackURL: callbackHostName + '/auth/callback',
	  scope: ['openid', 'email', 'https://www.googleapis.com/auth/calendar']
	}, function (accessToken, refreshToken, profile, done) {
	  profile.accessToken = accessToken;
	  return done(null, profile);
	}));

	// synchronization
	var io = __webpack_require__(27)(server);
	io.on('connection', function (socket) {
	  console.log('a socket connection was created');
	  socket.emit('an event', { some: 'data' });
	});

	// let httpProxy = require('http-proxy')
	// let proxy = httpProxy.createServer(8080, 'localhost').listen(8081)

	function sync() {
	  var p1 = todoist.synchronize();
	  var p2 = pinboard.synchronize();
	  var p3 = gcal.synchronize();
	  _promise2.default.all([p1, p2, p3]).then(function () {
	    console.log('Synced all datasources...');
	    io.sockets.emit('synchronized');
	  }).catch(function (err) {
	    console.log('error!');
	    console.log(err);
	  });
	}

	setInterval(function () {
	  console.log('Syncing datasources...');
	  sync();
	}, syncIntervalMins * 60 * 1000);

	sync();

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("path");

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("express");

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _assign = __webpack_require__(5);

	var _assign2 = _interopRequireDefault(_assign);

	var _getIterator2 = __webpack_require__(6);

	var _getIterator3 = _interopRequireDefault(_getIterator2);

	var _classCallCheck2 = __webpack_require__(7);

	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

	var _createClass2 = __webpack_require__(8);

	var _createClass3 = _interopRequireDefault(_createClass2);

	var _screens = __webpack_require__(10);

	var _screens2 = _interopRequireDefault(_screens);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var Screens = function () {
	  function Screens(todoist, pinboard, gcal) {
	    (0, _classCallCheck3.default)(this, Screens);

	    this.todoist = todoist;
	    this.pinboard = pinboard;
	    this.gcal = gcal;
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

	                  var newData = this.dataForGridScreenItem(gridScreenItem);
	                  var _screenItem = (0, _assign2.default)({}, gridScreenItem, newData);
	                  gridScreenItems.push(_screenItem);
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
	            case 'detail':
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
	  }, {
	    key: 'dataForGridScreenItem',
	    value: function dataForGridScreenItem(gridScreenItem) {
	      var newData = { data: '' };
	      switch (gridScreenItem.dataSource) {
	        case 'todoist':
	          newData['data'] = this.todoist.dataForGridScreenItem(gridScreenItem);
	          break;
	        case 'pinboard':
	          newData['data'] = this.pinboard.unreadItems();
	          break;
	        case 'gcal':
	          newData['data'] = this.gcal.eventsThisMonth();
	          break;
	      }
	      return newData;
	    }
	  }]);
	  return Screens;
	}();

	exports.default = Screens;

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("babel-runtime/core-js/object/assign");

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = require("babel-runtime/core-js/get-iterator");

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = require("babel-runtime/helpers/classCallCheck");

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = require("babel-runtime/helpers/createClass");

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _promise = __webpack_require__(15);

	var _promise2 = _interopRequireDefault(_promise);

	var _classCallCheck2 = __webpack_require__(7);

	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

	var _createClass2 = __webpack_require__(8);

	var _createClass3 = _interopRequireDefault(_createClass2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var todoist = __webpack_require__(11);
	var unirest = __webpack_require__(12);

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
	    key: 'dataForGridScreenItem',
	    value: function dataForGridScreenItem(gridScreenItem) {
	      var projectId = gridScreenItem.dataSourceOptions.project_id;
	      var maxItemCount = gridScreenItem.gridScreenViewOptions.maxItems;

	      return this.items.filter(function (item) {
	        return item.project_id === projectId && item.indent === 1;
	      }).sort(function (a, b) {
	        return a.item_order - b.item_order;
	      }).slice(0, maxItemCount).map(function (item) {
	        return {
	          dataSource_id: item.id,
	          title: item.content,
	          subTitle: item.priority
	        };
	      });
	    }
	  }]);
	  return DataSourceTodoist;
	}();

	exports.default = DataSourceTodoist;

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = [
		{
			"index": 0,
			"description": "Main screen",
			"type": "grid",
			"items": [
				{
					"index": 0,
					"title": "Quick Tasks",
					"dataSource": "todoist",
					"dataSourceOptions": {
						"project_id": 150709951
					},
					"gridScreenView": "list",
					"gridScreenViewOptions": {
						"maxItems": 8
					},
					"sort_order": 0,
					"transformer": "todoistListTransformers"
				},
				{
					"index": 1,
					"title": "Correspondence",
					"dataSource": "todoist",
					"dataSourceOptions": {
						"project_id": 158490814
					},
					"gridScreenView": "singleItem",
					"gridScreenViewOptions": {
						"maxItems": 8
					},
					"sort_order": 0,
					"transformer": "todoistListTransformers"
				},
				{
					"index": 2,
					"title": "Errands / Shopping",
					"dataSource": "todoist",
					"dataSourceOptions": {
						"project_id": 150709955
					},
					"gridScreenView": "list",
					"gridScreenViewOptions": {
						"maxItems": 8
					},
					"sort_order": 0,
					"transformer": "todoistListTransformers"
				},
				{
					"index": 3,
					"title": "Admin",
					"dataSource": "todoist",
					"dataSourceOptions": {
						"project_id": 164223196
					},
					"gridScreenView": "list",
					"gridScreenViewOptions": {
						"maxItems": 8
					},
					"sort_order": 0,
					"transformer": "todoistListTransformers"
				},
				{
					"index": 4,
					"title": "Inbox",
					"dataSource": "todoist",
					"dataSourceOptions": {
						"project_id": 157472345
					},
					"gridScreenView": "list",
					"gridScreenViewOptions": {
						"maxItems": 8
					},
					"sort_order": 0,
					"transformer": "todoistListTransformers"
				},
				{
					"index": 5,
					"title": "Routine",
					"dataSource": "todoist",
					"dataSourceOptions": {
						"project_id": 150714182
					},
					"gridScreenView": "list",
					"gridScreenViewOptions": {
						"maxItems": 8
					},
					"sort_order": 0,
					"transformer": "todoistListTransformers"
				},
				{
					"index": 6,
					"title": "Study / Uni",
					"dataSource": "todoist",
					"dataSourceOptions": {
						"project_id": 150710059
					},
					"gridScreenView": "list",
					"gridScreenViewOptions": {
						"maxItems": 8
					},
					"sort_order": 0,
					"transformer": "todoistListTransformers"
				},
				{
					"index": 7,
					"title": "Projects",
					"dataSource": "todoist",
					"dataSourceOptions": {
						"project_id": 150718495
					},
					"gridScreenView": "list",
					"gridScreenViewOptions": {
						"maxItems": 8
					},
					"sort_order": 0,
					"transformer": "todoistListTransformers"
				},
				{
					"index": 8,
					"title": "Unread Articles",
					"dataSource": "todoist",
					"dataSourceOptions": {
						"project_id": 156908333
					},
					"gridScreenView": "list",
					"gridScreenViewOptions": {
						"maxItems": 8
					},
					"sort_order": 0,
					"transformer": "todoistListTransformers"
				}
			]
		},
		{
			"index": 1,
			"description": "Yo",
			"type": "grid",
			"items": [
				{
					"index": 0,
					"title": "FFFFFFFFFFF",
					"dataSource": "todoist",
					"dataSourceOptions": {
						"project_id": 158490814
					},
					"gridScreenView": "list",
					"gridScreenViewOptions": {
						"maxItems": 8
					},
					"sort_order": 0,
					"transformer": "todoistListTransformers"
				},
				{
					"index": 1,
					"title": "Correspondence",
					"dataSource": "todoist",
					"dataSourceOptions": {
						"project_id": 150709951
					},
					"gridScreenView": "list",
					"gridScreenViewOptions": {
						"maxItems": 8
					},
					"sort_order": 0,
					"transformer": "todoistListTransformers"
				},
				{
					"index": 2,
					"title": "MHMMMMM",
					"dataSource": "todoist",
					"dataSourceOptions": {
						"project_id": 150709955
					},
					"gridScreenView": "list",
					"gridScreenViewOptions": {
						"maxItems": 8
					},
					"sort_order": 0,
					"transformer": "todoistListTransformers"
				},
				{
					"index": 3,
					"title": "Admin",
					"dataSource": "todoist",
					"dataSourceOptions": {
						"project_id": 164223196
					},
					"gridScreenView": "list",
					"gridScreenViewOptions": {
						"maxItems": 8
					},
					"sort_order": 0,
					"transformer": "todoistListTransformers"
				},
				{
					"index": 4,
					"title": "Inbox",
					"dataSource": "todoist",
					"dataSourceOptions": {
						"project_id": 157472345
					},
					"gridScreenView": "list",
					"gridScreenViewOptions": {
						"maxItems": 8
					},
					"sort_order": 0,
					"transformer": "todoistListTransformers"
				},
				{
					"index": 5,
					"title": "Routine",
					"dataSource": "todoist",
					"dataSourceOptions": {
						"project_id": 150714182
					},
					"gridScreenView": "list",
					"gridScreenViewOptions": {
						"maxItems": 8
					},
					"sort_order": 0,
					"transformer": "todoistListTransformers"
				},
				{
					"index": 6,
					"title": "Study / Uni",
					"dataSource": "todoist",
					"dataSourceOptions": {
						"project_id": 150710059
					},
					"gridScreenView": "list",
					"gridScreenViewOptions": {
						"maxItems": 8
					},
					"sort_order": 0,
					"transformer": "todoistListTransformers"
				},
				{
					"index": 7,
					"title": "Projects",
					"dataSource": "todoist",
					"dataSourceOptions": {
						"project_id": 150718495
					},
					"gridScreenView": "singleItem",
					"gridScreenViewOptions": {
						"maxItems": 8
					},
					"sort_order": 0,
					"transformer": "todoistListTransformers"
				},
				{
					"index": 8,
					"title": "Unread Articles",
					"dataSource": "todoist",
					"dataSourceOptions": {
						"project_id": 156908333
					},
					"gridScreenView": "list",
					"gridScreenViewOptions": {
						"maxItems": 8
					},
					"sort_order": 0,
					"transformer": "todoistListTransformers"
				}
			]
		}
	];

/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = require("node-todoist");

/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = require("unirest");

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _values = __webpack_require__(17);

	var _values2 = _interopRequireDefault(_values);

	var _promise = __webpack_require__(15);

	var _promise2 = _interopRequireDefault(_promise);

	var _classCallCheck2 = __webpack_require__(7);

	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

	var _createClass2 = __webpack_require__(8);

	var _createClass3 = _interopRequireDefault(_createClass2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var Pinboard = __webpack_require__(14);

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
/* 14 */
/***/ function(module, exports) {

	module.exports = require("node-pinboard");

/***/ },
/* 15 */
/***/ function(module, exports) {

	module.exports = require("babel-runtime/core-js/promise");

/***/ },
/* 16 */,
/* 17 */
/***/ function(module, exports) {

	module.exports = require("babel-runtime/core-js/object/values");

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _promise = __webpack_require__(15);

	var _promise2 = _interopRequireDefault(_promise);

	var _classCallCheck2 = __webpack_require__(7);

	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

	var _createClass2 = __webpack_require__(8);

	var _createClass3 = _interopRequireDefault(_createClass2);

	var _moment = __webpack_require__(25);

	var _moment2 = _interopRequireDefault(_moment);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var gcal = __webpack_require__(19);


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
	          var date1MonthAheadString = (0, _moment2.default)().add(31, 'days').format();
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
/* 19 */
/***/ function(module, exports) {

	module.exports = require("google-calendar");

/***/ },
/* 20 */
/***/ function(module, exports) {

	module.exports = require("passport-google-oauth");

/***/ },
/* 21 */
/***/ function(module, exports) {

	module.exports = require("passport");

/***/ },
/* 22 */
/***/ function(module, exports) {

	module.exports = require("body-parser");

/***/ },
/* 23 */,
/* 24 */
/***/ function(module, exports) {

	module.exports = require("express-session");

/***/ },
/* 25 */
/***/ function(module, exports) {

	module.exports = require("moment");

/***/ },
/* 26 */
/***/ function(module, exports) {

	module.exports = require("dotenv");

/***/ },
/* 27 */
/***/ function(module, exports) {

	module.exports = require("socket.io");

/***/ }
/******/ ]);