const axios = require('axios')
const querystring = require('querystring')
const { apiToken } = require('../../config')
const parse = require('./parse')
const matches = require('./matches')

module.exports = (req, res) => {
  const isPrivate = req.body.channel_name === 'directmessage'
  const historyUrl = `https://slack.com/api/${isPrivate ? 'im.history' : 'channels.history'}`
  const { user_name: sender, text } = req.body
  const { incorrect, correct, parseError } = parse(text)

  if (parseError) {
    return res.send('Correct something someone said. Supported formats:\n/correct incorrect = correct \n/correct /s/incorrect/correct')
  }

  axios.post(historyUrl, querystring.stringify({
    apiToken,
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
        apiToken,
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
