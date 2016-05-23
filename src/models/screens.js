import DataSourceTodoist from '../datasources/todoist'

export default class Screens {
  constructor() {
    this.todoist = new DataSourceTodoist()
    this.todoist.synchronize()
    this.screensConfig = require('./screens.json');
  }

  screenOne() {
    // console.log(this.todoist.data())

    let screenItems = []
    for (let gridScreenItem of this.screensConfig) {
      let projectId = gridScreenItem.dataSourceOptions.project_id
      let maxItemCount = gridScreenItem.gridScreenViewOptions.maxItems
      let newData = { data : transformTodoistListItem(this.todoist.data(), projectId, maxItemCount) }
      let screenItem = Object.assign(gridScreenItem, newData)
      screenItems.push(screenItem)
    }
    return screenItems
  }
}

function transformTodoistListItem(items, project_id, maxItemCount) {
  return items
  .filter((item) => {
    return item.project_id === project_id && item.indent === 1
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
