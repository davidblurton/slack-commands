const test = require('ava')
const matches = require('./matches')

test('should throw if no matches', assert => {
  const incorrect = 'bar'
  const res = {
    data: {
      messages: [
        { text: 'foo' },
      ],
    },
  }
  assert.throws(() => matches(incorrect)(res), `No messages containing bar in the last 10 messages.`)
})