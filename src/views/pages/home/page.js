import React from 'react';
import styles from './style.css';

export default class HomePage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
        items: [{data:[{title: 'hack'}]}, {data:[{title: 'hack'}]}, {data:[{title: 'hack'}]}, {data:[{title: 'hack'}]}, {data:[{title: 'hack'}]}, {data:[{title: 'hack'}]}, {data:[{title: 'hack'}]}, {data:[{title: 'hack'}]}, {data:[{title: 'hack'}]}]
    }
  }

  render() {
    return (
      <div className={styles.containerStyleCol}>
        <div className={styles.containerStyle}>
          {this.gridItem(0)}
          {this.gridItem(1)}
          {this.gridItem(2)}
        </div>
        <div className={styles.containerStyle}>
          {this.gridItem(3)}
          {this.gridItem(4)}
          {this.gridItem(5)}
        </div>
        <div className={styles.containerStyle}>
          {this.gridItem(6)}
          {this.gridItem(7)}
          {this.gridItem(8)}
        </div>
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
    var gridItems = this.state.items[index].data.map((data) => {
      return (
          <li>{data.title}</li>
      )
    })
    return (
      <div className={styles.flexItemStyle}>
        <p className={styles.titleStyle}>{this.state.items[index].title}</p>
        <ul>
          {gridItems}
        </ul>
      </div>
    )
  }
}
