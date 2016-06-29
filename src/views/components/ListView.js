import React from 'react'
import styles from './ListView.css'

export default class ListView extends React.Component {

  render() {
    if (!this.props.data) {
      return (<li>Nothing!</li>)
    }

    let maxItems = this.props.maxItems ? this.props.maxItems : 10
    let gridItems = this.props.data
    .slice(0, maxItems)
    .map((data) => {
      let subtitle = data.subtitle ? data.subtitle : '-'
      let title = data.titleUrl ? (<a href={data.titleUrl}>{data.title}</a>) : (data.title)
      if (data.subtitle) {
        return (<li>{title}<br/><i>{data.subtitle}</i></li>)
      } else {
        return (<li>{title}</li>)
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
