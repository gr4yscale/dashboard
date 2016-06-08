/**
 * App entry point
 */

import 'babel-polyfill';
import React from 'react'
import ReactDOM from 'react-dom'
import { Router, browserHistory } from 'react-router'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware, compose} from 'redux'
import thunk from 'redux-thunk'
import rootReducer from './redux/reducers/rootReducer'
// Routes
import Routes from './views/common/Routes'

// Base styling
import './views/common/base.css'

import { selectScreen } from './redux/actions/screenActions'

const store = createStore(
  rootReducer,
  compose(
    applyMiddleware(thunk),
    window.devToolsExtension ? window.devToolsExtension() : f => f
    )
  )

// Render the router
ReactDOM.render((
  <Provider store={store}>
    <Router history={browserHistory}>
        {Routes}
    </Router>
  </Provider>
), document.getElementById('app')) // make sure to use app element ID in .html

// keyboard shortcuts
document.body.addEventListener('keypress', (event) => {
  let numberPattern = /[0-9]/g
  if (numberPattern.test(event.key)) {
    let number = parseInt(event.key)
    store.dispatch(selectScreen(number - 1))
  }
})
