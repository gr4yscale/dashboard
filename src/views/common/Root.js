import React from 'react';

export default class Root extends React.Component {
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
