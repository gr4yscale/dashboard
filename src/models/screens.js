import DataSourceTodoist from '../datasources/todoist'
import DataSourcePinboard from '../datasources/pinboard'
import screensConfig from './screens.json'

export default class Screens {
  constructor() {
    this.todoist = new DataSourceTodoist()
    this.todoist.synchronize()
    this.pinboard = new DataSourcePinboard()
    this.pinboard.synchronize()
  }

  screenOne() {
    let screenItems = []
    for (let gridScreenItem of screensConfig) {
      let newData = {data: ''}
      switch (gridScreenItem.dataSource) {
        case 'todoist':
          newData['data'] = this.todoist.dataForGridScreenItem(gridScreenItem)
          break
        case 'pinboard':
          newData['data'] = this.pinboard.unreadItems()
          break
      }
      let screenItem = Object.assign(gridScreenItem, newData)
      screenItems.push(screenItem)
    }
    return screenItems
  }

}
