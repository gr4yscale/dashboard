const gcal = require('google-calendar')
import moment from 'moment'

const PRIMARY_CALENDAR_ID = 'gr4yscale@gmail.com'

export default class DataSourceGCal {
  constructor() {
    this.data = []
    this.accessToken = ''
  }

  setAccessToken(accessToken) {
    this.accessToken = accessToken
  }

  synchronize() {
    let todayString = moment().format()
    let date1MonthAheadString = moment().add(31, 'days').format()
    gcal(this.accessToken).events.list(PRIMARY_CALENDAR_ID, {singleEvents: 'true', orderBy: 'startTime', maxResults: 100, timeMin: todayString, timeMax: date1MonthAheadString}, (err, data) => {
      if (!err) {
        this.data = data.items
        console.log('* Fetched Google Calendars data')
      }
    })
  }

  formatData(data) {
    return data
    .map((item) => {
      let startDateTime = item.start.dateTime ? item.start.dateTime : item.start.date
      return {
        id: item.id,
        title: item.summary,
        subtitle: moment(startDateTime).format('MMMM Do YYYY, h:mm:ss a')
      }
    })
  }

  eventsThisMonth() {
    return this.formatData(this.data)
  }
}
