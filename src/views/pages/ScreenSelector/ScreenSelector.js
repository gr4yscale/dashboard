import React from 'react'
import { connect } from 'react-redux'
import {bindActionCreators} from 'redux'

import * as screenActions from './../../../redux/actions/screenActions'

import styles from './ScreenSelector.css'
import ViewFactory from '../../common/ViewFactory'

class ScreenSelector extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.props.fetchScreens()

    this.socket = io()
    this.socket.on('synchronized', () => {
      console.log('* Server synced, fetching new data from it now to update the client')
      this.props.fetchScreens()
    })
    this.socket.on('connect', () => {
      console.log('Websocket client connected to the server')
    })
  }

  render() {
    if (this.props.screens.length > 0) {
      let screen = this.props.screens[this.props.screenIndex]
      let data = screen.data ? screen.data : screen
      data = Object.assign({}, data, data.viewOptions)
      return (ViewFactory(screen.type, data))
    } else {
      return (<p>DATA IS COMING</p>)
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
