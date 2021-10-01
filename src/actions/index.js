const globalFilters = require('../filters/globalFilters');
const playerExists = require('../services/playerExists');
const cardAction = require('./cardAction');
const dadoAction = require('./dadoAction');
const entrarAction = require('./entrarAction');
const parImparAction = require('./parImparAction');
const profileAction = require('./profileAction');
const roletaAction = require('./roletaAction');

const prefix = process.env.PREFIX;

module.exports = async function messageAction(msg) {
    const isPlayer = await playerExists(msg.author.id);
    
    if(await globalFilters(msg)) return;

    if(!(msg.content.split(' ')[0] === `${prefix}entrar`) && !isPlayer) {
        msg.reply(' você precisa estar no jogo para usar esse comando. Digite $entrar');
        return;
    }

    switch(msg.content.split(' ')[0]) {
        case `${prefix}dado`:
            dadoAction(msg);
            break;
        case `${prefix}random`:
            randomAction(msg);
            break;
        case `${prefix}card`:
            cardAction(msg);
            break;
        case `${prefix}entrar`:
            await entrarAction(msg);
            break;
        case `${prefix}parimpar`:
            await parImparAction(msg);
            break;
        case `${prefix}perfil`:
            await profileAction(msg);
            break;
        case `${prefix}roleta`:
            await roletaAction(msg);
            break;
        case `${prefix}duelomortal`:
            await duelomortalAction(msg);
            break;
    }   
}
