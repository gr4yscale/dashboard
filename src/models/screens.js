import screensConfig from './screens.json'

export default class Screens {
  constructor(todoist, pinboard, gcal) {
    this.todoist = todoist
    this.pinboard = pinboard
    this.gcal = gcal
  }

  screens() {
    let screenItems = []
    for (let screenItem of screensConfig) {
      // FIXME: we're mutating screenItem here and adding it to an array
      switch (screenItem.type) {
        // handle grid screens
        case 'grid':
          let gridScreenItems = []
          for (let gridScreenItem of screenItem.items) {
            let newData = this.dataForItem(gridScreenItem)
            let newGridScreenItem = Object.assign({}, gridScreenItem, newData)
            gridScreenItems.push(newGridScreenItem)
          }
          screenItem.items = gridScreenItems
          break
        case 'list':
        case 'singleItem':                                        // for now singleItems get data in an items array to select a single item from
          let newData = this.dataForListItem(screenItem)
          screenItem = Object.assign({}, screenItem, newData)
          break
      }
      screenItems.push(screenItem)
    }
    return screenItems
  }

  // FIXME: very obviously in need of a refactor below... no care for now...

  dataForItem(item) {
    let newData = {data: ''}
    switch (item.dataSource) {
      case 'todoist':
        newData['data'] = this.todoist.dataForScreenItem(item)
        break
      case 'pinboard':
        newData['data'] = this.pinboard.unreadItems()
        break
      case 'gcal':
        newData['data'] = this.gcal.eventsThisMonth()
        break
      }
    return newData
  }

  dataForListItem(item) {
    let newData = {items: []}
    switch (item.dataSource) {
      case 'todoist':
        newData['items'] = this.todoist.dataForScreenItem(item)
        break
      case 'pinboard':
        newData['items'] = this.pinboard.unreadItems()
        break
      case 'gcal':
        newData['items'] = this.gcal.eventsThisMonth()
        break
      }
    return newData
  }

}
