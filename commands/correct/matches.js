module.exports = function(incorrect) {
  return response => {
    if (!response || !response.data) {
      throw new Error('No response')
    }
    const messages = response.data.messages.filter(m => m.text.includes(incorrect))
    if (messages.length === 0) {
      throw new Error(`No messages containing ${incorrect} in the last 10 messages.`)
    }
    return messages[0]
  }
}
