const todoist = require('node-todoist')
const unirest = require('unirest')

// Login to todoist and store the latest items

export default class DataSourceTodoist {
  constructor() {
    this.todoistItems = []
    // every so often synchronize?
  }

  synchronize() {
    todoist.login({email: 'gr4yscale@gmail.com', password: '[redacted]'}, (err,user) => {
        if(err){
            console.error(err);
            return;
        }
        const apiToken = user.api_token;
        const requestOptions = {
          token: apiToken,
          seq_no: 0,
          resource_types: '["items"]'
        }
        unirest.post('https://todoist.com/API/v6/sync')
        .send(requestOptions)
        .end((response) => {
          this.todoistItems = response.body.Items
        })
    })
  }

  data() {
    return this.todoistItems
  }
}
