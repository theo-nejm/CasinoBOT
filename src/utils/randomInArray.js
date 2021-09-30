const randomInt = require("./randomInt")

module.exports = (array) => {
    return array[randomInt(0, array.length)];
}