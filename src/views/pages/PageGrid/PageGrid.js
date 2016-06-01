import React from 'react';
import styles from './PageGridStyle.css';
import ListView from '../../components/ListView.js'

// There should be some way on the client to decide which React Components to create based on a server "screenType" enum
// We then pass the options / data in as props


export default class HomePage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
        items: [{data:[{title: 'hack'}]}, {data:[{title: 'hack'}]}, {data:[{title: 'hack'}]}, {data:[{title: 'hack'}]}, {data:[{title: 'hack'}]}, {data:[{title: 'hack'}]}, {data:[{title: 'hack'}]}, {data:[{title: 'hack'}]}, {data:[{title: 'hack'}]}]
    }
  }

  render() {
    return (
      <div className={styles.gridContainer}>
        <div className={styles.gridItem}>{this.gridItem(0)}</div>
        <div className={styles.gridItem}>{this.gridItem(1)}</div>
        <div className={styles.gridItem}>{this.gridItem(2)}</div>
        <div className={styles.gridItem}>{this.gridItem(3)}</div>
        <div className={styles.gridItem}>{this.gridItem(4)}</div>
        <div className={styles.gridItem}>{this.gridItem(5)}</div>
        <div className={styles.gridItem}>{this.gridItem(6)}</div>
        <div className={styles.gridItem}>{this.gridItem(7)}</div>
        <div className={styles.gridItem}>{this.gridItem(8)}</div>
      </div>
    )
  }

  componentDidMount() {
    this.serverRequest = $.get('screens', (result) => {
      this.setState({
        items : result,
      })
    })
  }

  gridItem(index) {
    var item = this.state.items[index];

    // TOFIX: switch on item.gridViewChild to show gridItems other than a list
    // pass in child view options and list of actions

    return (
      <ListView index={index} title={item.title} items={item.data} />
    )
  }
}
