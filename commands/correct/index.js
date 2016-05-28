const axios = require('axios')
const querystring = require('querystring')
const token = process.env.SLACK_TOKEN
const parse = require('./parse')
const matches = require('./matches')

module.exports = (req, res) => {
  // console.log(req.body)
  const isPrivate = req.body.channel_name === 'directmessage'
  const historyUrl = `https://slack.com/api/${isPrivate ? 'im.history' : 'channels.history'}`

  const sender = req.body.user_name
  const text = req.body.text

  const { incorrect, correct, parseError } = parse(text)

  if (parseError) {
    return res.send('Supported formats: /correct /s/foo/bar')
  }

  axios.post(historyUrl, querystring.stringify({
    token,
    channel: req.body.channel_id,
    count: 10,
  }))
  .then(matches(incorrect))
  .then(message => {
    const userBeingCorrected = message.user
    const replacementText = `<@${userBeingCorrected}>: ${message.text.replace(incorrect, `~${incorrect}~ ${correct}`)}`
    const attachments = [
      {
        text: replacementText,
        fallback: replacementText,
        footer: `Correction from ${sender}`,
        color: '#36a64f',
        mrkdwn_in: ['text']
      }
    ]

    axios.post('https://slack.com/api/chat.postMessage',
      querystring.stringify({
        token,
        channel: isPrivate ? userBeingCorrected : '#corrections',
        attachments: JSON.stringify(attachments),
      })
    ).then((postMessageResponse) => {
      res.json({
        text: `Thanks! Your correction was ${isPrivate ? 'sent as a direct message' : 'posted in #corrections'}`,
        attachments,
      })
    })
    .catch(err => {
      console.log(err)
      res.send('Error! ' + err.message)
    })
  }).catch(err => {
    res.send(err.message)
  })
}
