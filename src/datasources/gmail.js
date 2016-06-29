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
      this.messagesStream = this.gmail.messages('label:starred', {format: 'metadata', max: 10})

      this.messagesStream.on('data', (data) => {

        console.log(data.payload.headers)
        console.log('')

        let sanitizedData = {
          datasource_id: data.id,
          title: data.snippet,
          subtitle: ''
        }
        this.data.starredMessages.push(sanitizedData)
        console.log('Synced Gmail')
        // console.log(this.data.starredMessages)
      })
    })
  }

  starredMessages() {
    return this.data.starredMessages
  }
}
