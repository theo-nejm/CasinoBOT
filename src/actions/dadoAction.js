const randomNumber = require('../utils/randomInt');

module.exports = msg => {
    msg.reply(randomNumber(1, 7));
}