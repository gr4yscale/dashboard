import React from 'react'
import styles from './ListView.css'

export default class ListView extends React.Component {

  render() {
    if (!this.props.items) {
      return (<li>Nothing!</li>)
    }
    let gridItems = this.props.items.map((data) => {
      let subtitle = data.subtitle ? data.subtitle : '-'
      if (data.subtitle) {
        return (<li>{data.title}<br/><i>{data.subtitle}</i></li>)
      } else {
        return (<li>{data.title}</li>)
      }
    })
    return (
      <div className={styles.listViewContainer}>
        <p className={styles.titleStyle}>{this.props.title}</p>
        <ul className={styles.list}>
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
