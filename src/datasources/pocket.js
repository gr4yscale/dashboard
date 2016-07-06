const unirest = require('unirest')


export default class DataSourcePocket {
  constructor() {
    this.data = []
    this.accessToken = ''
  }

  setAccessToken(accessToken) {
    this.accessToken = accessToken
  }

  // get favorite items only for now
  synchronize() {
    console.log('Syncing pocket')
    return new Promise((resolve, reject) => {
      let requestOptions = {
        consumer_key: process.env.POCKET_CONSUMER_KEY,
        access_token: this.accessToken,
        favorite: 1
      }
      unirest.post('https://getpocket.com/v3/get')
      .send(requestOptions)
      .end((response) => {
        this.data = []
        let data = response.body.list
        if (data) {
          for (var key in data) {
            if (data.hasOwnProperty(key)) {
              this.data.push(data[key])
            }
          }
        }
        console.log(this.data[0])
        resolve(this.data)
      })
    })
  }

  formatData(data) {
    return data
    .map((item) => {
      return {
        id: item.item_id,
        title: item.resolved_title,
        titleUrl: item.resolved_url,
        subtitle: item.resolved_url
      }
    })
  }

  favoritedItems() {
    if (this.data) {
      return this.formatData(this.data)
    }
  }
}
