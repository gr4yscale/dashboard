import React from 'react'
import { connect } from 'react-redux'
import styles from './base.css'

class Root extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className={styles.rootContainer}>
        {this.props.children}
      </div>
    )
  }
}

export default connect()(Root)
