const FeedParser = require('feedparser')
// unfortunately we must use request instead of promises-based axios because FeedParser wants a stream
const request = require('request')

export default class DataSourceRSS {
  constructor(url, transform) {
    this.url = url
    this.data = []
    if (transform) {
      this.transform = transform
    } else {
      this.transform = (data) => {
        return {
          title: data.title,
          subtitle: '',
          datasource_id: data.guid,
          titleUrl: data.link,
          description: data.description
        }
      }
    }
  }

  synchronize() {
    console.log(`Syncing RSS feed: RSS feed: ${this.url}`)
    return new Promise((resolve, reject) => {
      let feedparser = new FeedParser()
      this.data = []

      let feedParsingComplete = (err) => {
        if (err) {
          console.log(`Error parsing RSS feed: ${this.url}`)
          console.log(err)
          reject(err)
        } else {
          resolve()
        }
      }

      // get a reference to data before 'this' scope is changed with ES5 style syntax
      // Using ES5 function syntax on the below callbacks to capture a reference to the feedparser stream
      let data = this.data

      // make a stream requesting feed XML and pipe it to FeedParser
      request.get(this.url)
              .on('error', feedParsingComplete)
              .on('response', function (res) {
                let stream = this  // request response callback is a stream, feedparser wants a stream
                if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'))
                stream.pipe(feedparser)
              })

      // hook up stream callbacks
      feedparser.on('error', feedParsingComplete)
      feedparser.on('end', feedParsingComplete)

      feedparser.on('readable', function() {
        let stream = this
        let meta = this.meta
        let item

        while (item = stream.read()) {
          data.push(item)
        }
      })
    })
  }

  items() {
    // transform the data on demand - we could transform it on the end callback of the stream so that it is already ready,
    // but then there is potential for a race condition without keeping track of "isStreaming" state,
    // which I could have done in the amount of time it took to type this comment. DEAL WITH IT, this is plenty fast enough
    return this.data.map(this.transform)
  }
}
