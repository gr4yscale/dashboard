import React from 'react'
import styles from './SingleItemView.css'

export default class SingleItemView extends React.Component {

  render() {
    if (!this.props.items) {
      return (<li>Nothing!</li>)
    }
    let rand = Math.floor(Math.random() * this.props.items.length)
    let data = this.props.items[rand]
    return (
      <div className={styles.singleItemListViewContainer}>
        <p className={styles.singleItemListViewList}>{data.title}</p>
      </div>
    )
  }
}
