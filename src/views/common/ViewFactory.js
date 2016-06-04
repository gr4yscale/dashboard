import React from 'react'
import ListView from '../components/ListView'

const ViewFactory = (viewType, propsToPass) => {
  let returnedView;
  switch (viewType) {
    case 'list':
      returnedView = React.createElement(ListView, propsToPass)
      break;
  }
  return returnedView
}

export default ViewFactory
