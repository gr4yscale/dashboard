const unirest = require('unirest')

// Login to todoist and store the latest items

export default class DataSourceTodoist {
  constructor() {
    this.items = []
    // every so often synchronize?
  }

  synchronize() {
    if (!this.accessToken) return

    return new Promise((resolve, reject) => {
      const requestOptions = {
        token: this.accessToken,
        seq_no: 0,
        resource_types: '["items"]'
      }

      unirest.post('https://todoist.com/API/v7/sync')
      .send(requestOptions)
      .end((response) => {
        this.items = response.body.items
        console.log('* Fetched Todoist data')
        resolve(response.body.items)
      })
    })
  }

  dataForScreenItem(screenItem) {
    let projectId = screenItem.dataSourceOptions.project_id
    let maxItemCount = screenItem.viewOptions.maxItems

    return this.items
    .filter((item) => {
      if (item.project_id === 150709951 || item.project_id === 173212883) // inbox and 'mission critical' don't need priority
        return (item.project_id === projectId && item.indent === 1)
      else
        return (item.project_id === projectId && item.indent === 1 && item.priority > 1)
    })
    .sort((a, b) => {
      return a.item_order - b.item_order
    })
    .slice(0, maxItemCount).map((item) => {
      return {
        datasource_id : item.id,
        title: item.content,
        subtitle: ''
      }
    })
  }

}
