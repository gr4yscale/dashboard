import React from 'react'
import ListView from '../components/ListView'
import SingleItemView from '../components/SingleItemView'

const ViewFactory = (viewType, propsToPass) => {
  let returnedView;
  switch (viewType) {
    case 'list':
      returnedView = React.createElement(ListView, propsToPass)
      break
    case 'singleItem':
      returnedView = React.createElement(SingleItemView, propsToPass)
      break
  }
  return returnedView
}

export default ViewFactory
