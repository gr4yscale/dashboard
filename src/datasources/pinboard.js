const Pinboard = require('node-pinboard')

// const unirest = require('unirest')

// Login to todoist and store the latest items

export default class DataSourcePinboard {
  constructor() {
    this.pinboard = new Pinboard(process.env.PINBOARD_API_KEY)
    this.data = []
  }

  synchronize() {
    return new Promise((resolve, reject) => {
      this.pinboard.all({}, (err, res) => {
        if (err) {
          reject(err)
        } else {
          let data = Object.values(res)
          console.log('* Fetched Pinboard data')
          this.data = data
          resolve(data)
        }
      })

    })
  }

  formatData(data) {
    return data
    .map((item) => {
      return {
        id: item.href,
        title: item.description,
        subtitle: item.url
      }
    })
  }

  unreadItems() {
    let data = this.data.filter((item) => {
      return item.toread === 'yes'
    })
    return this.formatData(data)
  }
}
