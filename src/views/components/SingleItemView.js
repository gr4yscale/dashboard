import React from 'react'
import styles from './SingleItemView.css'

export default class SingleItemView extends React.Component {

  render() {
    if (!this.props.data) {
      return (<li>Nothing!</li>)
    }
    let rand = Math.floor(Math.random() * this.props.data.length)
    let data = this.props.data[rand]

    return (
      <div className={styles.singleItemListViewContainer}>
        <p className={styles.singleItemListViewList}>{data.title}</p>
      </div>
    )
  }
}
