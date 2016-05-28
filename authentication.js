const { token } = require('./config')

module.exports = (req, res, next) => {
  if (req.body.token !== token) {
    res.sendStatus(401)
  } else {
    next()
  }
}
