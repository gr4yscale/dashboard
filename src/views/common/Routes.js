import React from 'react';
import { Route, IndexRoute } from 'react-router';

import Root from './Root';
import HomePage from '../pages/home/page';

export default (
  <Route path="/" component={Root}>
    <IndexRoute path="home" component={HomePage} />
  </Route>
);
