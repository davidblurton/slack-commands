const axios = require('axios')
const querystring = require('querystring')
const token = process.env.SLACK_TOKEN
const parse = require('./parse')

module.exports = (req, res) => {
  // console.log(req.body)
  const isPrivate = req.body.channel_name === 'directmessage'
  const historyUrl = `https://slack.com/api/${isPrivate ? 'im.history' : 'channels.history'}`

  const sender = req.body.user_name
  const text = req.body.text

  const parsed = parse(text)

  if (!parsed) {
    return res.send('Supported formats: /correct /s/foo/bar')
  }

  const { incorrect: search, correct: replacement } = parsed

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
    const attachments = JSON.stringify([
      {
        text: replacementText,
        fallback: replacementText,
        footer: `Correction from ${sender}`,
        color: '#36a64f',
        mrkdwn_in: ['text']
      }
    ])

    axios.post('https://slack.com/api/chat.postMessage',
      querystring.stringify({
        token,
        channel: isPrivate ? userBeingCorrected : '#corrections',
        attachments,
      })
    ).then((postMessageResponse) => {
      res.json({
        text: `Thanks! Your correction was ${isPrivate ? 'sent as a direct message' : 'posted in #corrections'}`,
        attachments: [
            {
                text: replacementText,
                fallback: replacementText,
                footer: `Correction from ${sender}`,
                color: '#36a64f',
                mrkdwn_in: ['text']
            }
        ]
      })
    })
    .catch(err => {
      console.log(err)
      res.send('Error! ' + err.message)
    })
  }).catch(err => {
    console.log(err)
    res.send('Error! ' + err.message)
  })
}
