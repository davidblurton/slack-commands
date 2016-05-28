const test = require('ava')
const parse = require('./parse')

test('should parse vim syntax', assert => {
  const input = '/s/foo is bar/bar is bar'
  assert.deepEqual(parse(input), {
    incorrect: 'foo is bar',
    correct: 'bar is bar',
  })
})

test('should parse simple syntax', assert => {
  const input = 'bad words = good words'
  assert.deepEqual(parse(input), {
    incorrect: 'bad words',
    correct: 'good words',
  })
})

test('should return null if no pattern matches', assert => {
  const input = 'help'
  assert.is(parse(input), null)
})
