import React from 'react'
import { Route, IndexRoute } from 'react-router'

import Root from './Root'
import ScreenSelector from '../pages/ScreenSelector/ScreenSelector'

export default (
  <Route path="/" component={Root}>
    <IndexRoute component={ScreenSelector} />
  </Route>
);
