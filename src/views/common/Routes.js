import React from 'react'
import { Route, IndexRoute } from 'react-router'

import Root from './Root'
import PageGrid from '../pages/PageGrid/PageGrid'
import ListTest from '../pages/listTest/page'

export default (
  <Route path="/" component={Root}>
    <IndexRoute component={PageGrid} />
  </Route>
);
