const moment = require('moment')

function formatMessage(user, text) {
  return {
    user,
    text,
    time: moment().format('h:m a')
   }
}

module.exports = formatMessage