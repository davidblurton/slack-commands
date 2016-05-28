const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios')
const querystring = require('querystring')

const token = 'token'

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.post('/', (req, res) => {
  // console.log(req.body)
  const isPrivate = req.body.channel_name === 'directmessage'

  const historyUrl = `https://slack.com/api/${isPrivate ? 'im.history' : 'channels.history'}`
  const vimRegex = /\/s\/(\w*)\/(\w*)/

  const sender = req.body.user_name
  const text = req.body.text

  const matches = text.match(vimRegex)

  if (!matches || text === 'help') {
    return res.send('Supported formats: /correct /s/foo/bar')
  }

  const search = matches[1]
  const replacement = matches[2]

  axios.post(historyUrl, querystring.stringify({
    token,
    channel: req.body.channel_id,
    count: 10,
  })).then((imResponse) => {
    const messages = imResponse.data.messages

    const matchingMessages = messages.filter(m => m.text.includes(search))

    if (matchingMessages.length === 0) {
      return res.send(`No messages containing ${search} in the last 10 messages.`)
    }

    const userBeingCorrected = matchingMessages[0].user
    const replacementText = `<@${userBeingCorrected}>: ${matchingMessages[0].text.replace(search, `~${search}~ ${replacement}`)}`

    axios.post('https://slack.com/api/chat.postMessage',
      querystring.stringify({
        token,
        channel: isPrivate ? userBeingCorrected : '#corrections',
        attachments: JSON.stringify([
          {
            text: replacementText,
            footer: `Correction from ${sender}`,
            color: '#36a64f',
            mrkdwn_in: ['text']
          }
        ])
      })
    ).then((postMessageResponse) => {
      res.send(`Thanks! Your correction was ${isPrivate ? 'sent as a direct message' : 'posted in #corrections'}`)

    })
    .catch(err => {
      console.log(err)
      res.send('Error! ' + err.message)
    })
  }).catch(err => {
    console.log(err)
    res.send('Error! ' + err.message)
  })
})

app.listen(3000, () => {
  console.log('Slack correct running on port 3000!')
});
