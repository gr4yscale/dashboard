import React from 'react';
import styles from './ListView.css';

export default class ListView extends React.Component {

  render() {
    console.log(this.props)
    if (!this.props.items) {
      return (<li>Nothing!</li>)
    }
    let gridItems = this.props.items.map((data) => {
      let subtitle = data.subtitle ? data.subtitle : '-'
      return (
          <li>{data.title}<br/>{subtitle}</li>
      )
    })
    return (
      <div className={styles.flexItemStyle}>
        <p className={styles.titleStyle}>{this.props.title}</p>
        <ul>
          {gridItems}
        </ul>
      </div>
    )
  }

  // proptypes.........
  // items[] <- item.title, item.subTitle, item.sort_order, item.id
  // title
  // ???????
}
