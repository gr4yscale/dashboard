import screensConfig from './screens.json'

export default class Screens {
  // FIXME: beauuuuutiful - REFACTOR
  constructor(todoist, pinboard, gcal, evernote, gmail, github, creativeai, hackernews, pocket) {
    this.todoist = todoist
    this.pinboard = pinboard
    this.gcal = gcal
    this.evernote = evernote
    this.gmail = gmail
    this.github = github
    this.creativeai = creativeai
    this.hackernews = hackernews
    this.pocket = pocket
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
    // console.log(item)
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
      case 'gmail':
        newData['data'] = this.gmail.starredMessages()
        break
      case 'github':
        newData['data'] = this.github.items()
        break
      case 'creativeai':
        newData['data'] = this.creativeai.items()
        break
      case 'hackernews':
        newData['data'] = this.hackernews.items()
        break
      case 'evernote':
        newData['data'] = this.evernote.scratchPadNote(item)
        break
      case 'pocket':
        newData['data'] = this.pocket.favoritedItems()
        break
      }
    return newData
  }

  dataForListItem(item) {
    // console.log(item)
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
      case 'gmail':
        newData['items'] = this.gmail.starredMessages()
        break
      case 'github':
        newData['items'] = this.github.items()
        break
      case 'creativeai': {
        console.log(this.creativeai.items())
        newData['items'] = this.creativeai.items()
        break
      }
      case 'hackernews':
        newData['items'] = this.hackernews.items()
        break
      case 'evernote':
        newData['items'] = this.evernote.scratchPadNote(item)
        break
      case 'pocket':
        newData['items'] = this.pocket.favoritedItems()
        break
      }
    return newData
  }

}
