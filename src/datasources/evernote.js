const Evernote = require('evernote').Evernote
const ENML = require('enml-js')

export default class DataSourceEvernote {
  constructor() {
    this.accessToken = ''
    this.data = {
      scratchpadNoteContent : ''
    }
  }

  setAccessToken(accessToken) {
    this.accessToken = accessToken
  }

  // TOFIX: give this datasource a list of note ids, and make an accessor
  // for noteItems by passing in the evernote note guid
  
  synchronize() {
    console.log('Syncing evernote....')
    return new Promise((resolve, reject) => {
      this.client = new Evernote.Client({token: this.accessToken, sandbox: false})
      this.noteStore = this.client.getNoteStore()

      // for now I just care about a few specific notes from evernote, this datasource will just provide convenience to their content
      this.noteStore.getNote(this.accessToken, '79467e95-4a67-4ce2-9fb8-6b6a6f4e70d3', true, false, false, false, (err, note) => {
        if (err) {
          console.log('Evernote datasource encountered an error')
          console.log(err)
        } else {
          try {
            let plainTextNote = ENML.PlainTextOfENML(note.content)
            this.data['scratchpadNoteContent'] = plainTextNote.split('\n').reverse()
            console.log('* Fetched Evernote data')
            resolve(this.data)
          } catch (err) {
            console.log('* FAILED fetching Evernote data')
            reject(err)
          }
        }
      })
    })
  }

  scratchPadNote(screenItem) {
    if (!this.data['scratchpadNoteContent']) return

    let maxItemCount = screenItem.viewOptions.maxItems

    return this.data['scratchpadNoteContent']
      .slice(0, maxItemCount)
      .map((line) => {
      return {
        datasource_id : 'yo',
        title: line,
        subtitle: ''
      }
    })
  }
}
