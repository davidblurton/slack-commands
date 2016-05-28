const express = require('express')
const bodyParser = require('body-parser')

const { port } = require('./config')
const authentication = require('./authentication')
const correct = require('./commands/correct')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(authentication)
app.post('/correct', correct)
app.get('/', (req, res) => res.send('Slack commands'))

app.listen(port, () => {
  console.log(`Slack commands running on port ${port}`)
});
