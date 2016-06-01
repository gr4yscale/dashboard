import screensConfig from './screens.json'

export default class Screens {
  constructor(todoist, pinboard, gcal) {
    this.todoist = todoist
    this.pinboard = pinboard
    this.gcal = gcal
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
        case 'gcal':
          newData['data'] = this.gcal.eventsThisMonth()
          break
      }
      let screenItem = Object.assign(gridScreenItem, newData)
      screenItems.push(screenItem)
    }
    return screenItems
  }

}
