const express = require('express')
const bodyParser = require('body-parser')
const app = express()

const correct = require('./commands/correct')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.post('/correct', correct)
app.get('/', (req, res) => res.send('Slack Commands'))
app.listen(3000, () => {
  console.log('Slack correct running on port 3000!')
});
