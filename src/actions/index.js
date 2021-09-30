const cardAction = require('./cardAction');
const dadoAction = require('./dadoAction');

const prefix = process.env.PREFIX;

module.exports = async function messageAction(msg) {
    if(!msg.content) return;

    switch(msg.content) {
        case `${prefix}dado`:
            dadoAction(msg);
            break;
        case `${prefix}random`:
            randomAction(msg);
            break
        case `${prefix}card`:
            cardAction(msg);
            break
    }
}
