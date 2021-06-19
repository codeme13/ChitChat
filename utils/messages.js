
const moment = require('moment');

function formatMessage(username, text,position) {
  return {
    username,
    text,
    position,
    time: moment().format('h:mm a')
  };
}

module.exports = formatMessage;