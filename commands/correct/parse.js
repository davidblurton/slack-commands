module.exports = input => {
  const patterns = [
    /\/s\/([^/]+)\/([^/]+)/, // vim style: /s/incorrect/correct
    /([^=].+)=(.*)/,
  ]
  for (const [index, regex] of patterns.entries()) {
    if (regex.test(input)) {
      let [_, incorrect, correct] = input.match(regex)
      incorrect = incorrect.trim()
      correct = correct.trim()
      return { incorrect, correct }
    }
  }
  return {
    parseError: `Didn't match any pattern`
  }
}