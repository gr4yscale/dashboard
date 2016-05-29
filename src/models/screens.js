import DataSourceTodoist from '../datasources/todoist'

export default class Screens {
  constructor() {
    this.todoist = new DataSourceTodoist()
    this.todoist.synchronize()
    this.screensConfig = require('./screens.json');
  }

  screenOne() {
    let screenItems = []
    for (let gridScreenItem of screensConfig) {
      let newData = {data: ''}
      switch (gridScreenItem.dataSource) {
        case 'todoist':
          newData['data'] = this.todoist.dataForGridScreenItem(gridScreenItem)
          break
      }
      let screenItem = Object.assign(gridScreenItem, newData)
      screenItems.push(screenItem)
    }
    return screenItems
  }

}
