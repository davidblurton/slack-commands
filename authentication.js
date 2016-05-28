const { apiToken } = require('./config')

module.exports = (req, res, next) => {
  if (req.body.token !== apiToken) {
    res.sendStatus(401)
  } else {
    next()
  }
}
