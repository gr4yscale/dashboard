import React from 'react'
import ListView from '../components/ListView'
import SingleItemView from '../components/SingleItemView'
import PageGrid from '../pages/PageGrid/PageGrid'

const ViewFactory = (viewType, propsToPass) => {
  let returnedView;
  switch (viewType) {
    case 'list':
      returnedView = React.createElement(ListView, propsToPass)
      break
    case 'singleItem':
      returnedView = React.createElement(SingleItemView, propsToPass)
      break
    case 'grid':
      returnedView = React.createElement(PageGrid, propsToPass)
  }
  return returnedView
}

export default ViewFactory
