const Evernote = require('evernote').Evernote

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

  synchronize() {
    console.log('Syncing evernote....')
    return new Promise((resolve, reject) => {
      this.client = new Evernote.Client({token: this.accessToken})
      this.noteStore = this.client.getNoteStore()

      // for now I just care about a few specific notes from evernote, this datasource will just provide convenience to their content
      this.noteStore.getNote(this.accessToken, 'bbce1a9e-4d1d-4c86-a20a-4ebdba22ed96', true, false, false, false, (err, note) => {
        if (err) {
          console.log('Evernote datasource encountered an error')
          console.log(err)
        } else {
          this.data['scratchpadNoteContent'] = note.content
          console.log('* Fetched Evernote data')
          resolve(this.data)  
        }
      })
    })
  }
}
