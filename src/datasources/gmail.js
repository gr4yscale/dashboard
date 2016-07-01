const Gmail = require('node-gmail-api')

export default class DataSourceGmail {
  constructor() {
    this.accessToken = ''
    this.data = {
      starredMessages : []
    }
  }

  setAccessToken(accessToken) {
    this.accessToken = accessToken
  }

  synchronize() {
    console.log('Syncing gmail....')
    this.data['starredMessages'] = []
    return new Promise((resolve, reject) => {

      this.gmail = new Gmail(this.accessToken)
      this.messagesStream = this.gmail.messages('label:starred', {format: 'metadata', max: 25})

      this.messagesStream.on('data', (data) => {
        let sanitizedData = {
          datasource_id: data.id,
          title: data.snippet,
          subtitle: ''
        }
        this.data.starredMessages.push(sanitizedData)
      })
      // TOFIX: this is a hack. messages are streamed in so Promises (like the rest of the datasources use) are awkward here
      resolve(this.data)
    })
  }

  starredMessages() {
    return this.data.starredMessages
  }
}
