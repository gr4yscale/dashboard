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
    return this.props.items.map((item, index) => {
      return (<div className={styles.gridItem}>{this.gridItem(index)}</div>)
    })
  }

  gridItem(index) {
    let item = this.props.items[index];
    let props = {
      index,
      title: item.title,
      items: item.data,
    }
    // create a ReactElement by giving it the view type (item.gridScreenView) and some props.
    // React will turn this into a ReactComponent for us
    return ViewFactory(item.gridScreenView, props)
  }
}

export default connect(
  (state) => {
    return {
      items: state.screens[state.screenIndex].items,
    }
  }
)(PageGrid)
