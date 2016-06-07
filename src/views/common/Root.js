import React from 'react'
import { connect } from 'react-redux'

class Root extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div id="container">
        {this.props.children}
      </div>
    )
  }
}

export default connect()(Root)
