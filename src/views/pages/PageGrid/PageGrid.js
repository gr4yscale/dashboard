import React from 'react'
import { connect } from 'react-redux'

import styles from './PageGridStyle.css'
import ListView from '../../components/ListView'
import ViewFactory from '../../common/ViewFactory'

// There should be some way on the client to decide which React Components to create based on a server "screenType" enum
// We then pass the options / data in as props


class PageGrid extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
        items: [{data:[{title: 'hack'}]}, {data:[{title: 'hack'}]}, {data:[{title: 'hack'}]}, {data:[{title: 'hack'}]}, {data:[{title: 'hack'}]}, {data:[{title: 'hack'}]}, {data:[{title: 'hack'}]}, {data:[{title: 'hack'}]}, {data:[{title: 'hack'}]}]
    }
  }

  render() {
    return (
      <div className={styles.gridContainer}>
        {this.gridItems()}
      </div>
    )
  }

  gridItems() {
    return this.props.data.map((item, index) => {
      return (<div className={styles.gridItem}>{this.gridItem(index)}</div>)
    })
  }

  gridItem(index) {
    let data = this.props.data[index];
    data = Object.assign({}, data, data.viewOptions)
    // create a ReactElement by giving it the view type (item.gridScreenView) and some props.
    // React will turn this into a ReactComponent for us
    return ViewFactory(data.gridScreenView, data)
  }
}

export default connect(
  (state) => {
    return {
      data: state.screens[state.screenIndex].items,
    }
  }
)(PageGrid)
