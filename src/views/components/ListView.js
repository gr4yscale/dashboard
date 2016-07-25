import React from 'react'
import styles from './ListView.css'

// TOFIX: refactor soon if we begin handling too many datasource case-specific things here; this should be generic

export default class ListView extends React.Component {

  renderStandardItem(data) {
    let title = data.titleUrl ? (<a href={data.titleUrl}>{data.title}</a>) : (data.title)
    let subtitle = data.subtitle ? data.subtitle : '-'
    if (data.subtitle) {
      return (<li>{title}<br/><i>{data.subtitle}</i></li>)
    }
    else {
      return (<li>{title}</li>)
    }
  }

  renderHNItem(data) {
    let description = data.description ? data.description : '-'
    let ptsCountText = description.substring(3, description.indexOf(','))
    let commentsStartIndex = description.indexOf('">') + 2
    let commentsEndIndex = description.indexOf('</')
    let commentsText = description.substring(commentsStartIndex, commentsEndIndex)
    let hnText = ptsCountText + '  |  ' + commentsText
    let sanitisedData = Object.assign({}, data, {title: data.title.substring(data.title.indexOf(';') + 2)})

    return (
      <div>
        {this.renderStandardItem(sanitisedData)}
        <p style={{fontSize: 12}}><i>{hnText}</i></p>
      </div>
    )
  }

  render() {
    if (!this.props.data && !this.props.items) {
      return (<li>Nothing!</li>)
    }

    let maxItems = this.props.maxItems ? this.props.maxItems : 10
    let data = this.props.data ? this.props.data : this.props.items

    // build up array of react elements
    let items = data.slice(0, maxItems)
    .map((data) => {
      // switch (this.props.dataSource) {
        // case 'hackernews':
          // return this.renderHNItem(data)
        // default:
          return this.renderStandardItem(data)
      // }
    })

    return (
      <div className={styles.listViewContainer}>
        <p className={styles.titleStyle}>{this.props.title}</p>
        <ul className={styles.list}>
          {items}
        </ul>
      </div>
    )
  }
}
