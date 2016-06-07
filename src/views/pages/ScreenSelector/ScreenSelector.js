import React from 'react'
import { connect } from 'react-redux'
import {bindActionCreators} from 'redux'

import * as screenActions from './../../../redux/actions/screenActions'

import styles from './ScreenSelector.css'
import PageGrid from '../PageGrid/PageGrid'

class ScreenSelector extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.props.fetchScreens()

    this.socket = io()
    this.socket.on('synchronized', () => {
      console.log('* Fetching new data from server')
      this.props.fetchScreens()
    })
    this.socket.on('connect', () => {
      console.log('Websocket client connected to the server')
    })
  }

  reactElementForScreenType(viewType, propsToPass) {
    let returnedElement;
    switch (viewType) {
      case 'grid':
        returnedElement = React.createElement(PageGrid, propsToPass)
        break
    }
    return returnedElement
  }

  render() {
    if (this.props.screens) {
      let screen = this.props.screens[this.props.screenIndex]
      let element = this.reactElementForScreenType(screen.type, screen.data)
      return (element)
    } else {
      return (<p>its coming</p>)
    }
  }
}

export default connect(
  (state) => {
    return {
      screenIndex: state.screenIndex,
      screens: state.screens,
    }
  },
  (dispatch) => {
    return {
      ...bindActionCreators(screenActions, dispatch),
    }
  }
)(ScreenSelector)
