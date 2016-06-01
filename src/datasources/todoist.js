const todoist = require('node-todoist')
const unirest = require('unirest')

// Login to todoist and store the latest items

export default class DataSourceTodoist {
  constructor() {
    this.items = []
    // every so often synchronize?
  }

  synchronize() {
    todoist.login({email: process.env.TODOIST_USERNAME, password: process.env.TODOIST_PASS}, (err, user) => {
        if(err){
            console.log(err);
            return;
        }
        const apiToken = user.api_token;
        const requestOptions = {
          token: apiToken,
          seq_no: 0,
          resource_types: '["items"]'
        }
        unirest.post('https://todoist.com/API/v6/sync')
        .send(requestOptions)
        .end((response) => {
          this.items = response.body.Items
          console.log('* Fetched Todoist data')
        })
    })
  }

  dataForGridScreenItem(gridScreenItem) {
    let projectId = gridScreenItem.dataSourceOptions.project_id
    let maxItemCount = gridScreenItem.gridScreenViewOptions.maxItems

    return this.items
    .filter((item) => {
      return item.project_id === projectId && item.indent === 1
    })
    .sort((a, b) => {
      return a.item_order - b.item_order
    })
    .slice(0, maxItemCount).map((item) => {
      return {
        dataSource_id : item.id,
        title: item.content,
        subTitle: item.priority
      }
    })
  }
}
