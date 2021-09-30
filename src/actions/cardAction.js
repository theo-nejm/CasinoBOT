const { MessageEmbed } = require("discord.js");
const randomInArray = require("../utils/randomInArray");
const randomInt = require("../utils/randomInt");


module.exports = msg => {
    const game = {
        isRunning: true,
        round: 0,
        total: 0,
        botResult: randomInt(10, 16) + randomInt(0, 12)
    }

    chooseCard(msg, game);
}

function chooseCard(msg, game) {
    if(!game.isRunning) return;
    
    const cards = {
        'A': 11,
        'J': 10,
        'Q': 10,
        'K': 10,
        '9': 9,
        '8': 8,
        '7': 7,
        '6': 6,
        '5': 5,
        '4': 4,
        '3': 3,
        '2': 2,
    }
    
    const naipes = ['copas', 'ouro', 'espada', 'paus'];
    const naipe = randomInArray(naipes);

    const cardIndex = randomInt(0, Object.keys(cards).length);
    
    const carta = Object.keys(cards)[cardIndex];
    const cardValue = Object.values(cards)[cardIndex];

    game.total += cardValue;
    game.round += 1;

    if(game.total >= 21) {
        finishGame(msg, game);
        return;
    }

    const embed = new MessageEmbed()
        .setColor([35, 23, 45])
        .setTitle(`Você recebeu um ${carta} de ${naipe}\nTotal = ${game.total}`);
        
    msg.channel.send(embed).then(embedMsg => {
        const possibleReactions = ['🃏', '❌']

        possibleReactions.forEach((reaction, user) => embedMsg.react(reaction));

        const filter = (reaction, user) => {
            return possibleReactions.includes(reaction.emoji.name) && user.id === msg.author.id;
        }

        embedMsg.awaitReactions(filter, { max: 1, time: 15000, errors: ['time'] })
            .then(reactions => {
                const reaction = reactions.first();
                
                const choosenOption = possibleReactions.indexOf(reaction.emoji.name);
                
                if(choosenOption === 0) {
                    chooseCard(msg, game);
                } else {
                    finishGame(msg, game);
                }
            })
    })
}

function finishGame(msg, game) {
    const newEmbed = new MessageEmbed();

    game.isRunning = false;

    if(game.botResult > 21 && game.playerResult > 21 || game.botResult == game.playerResult) {
        newEmbed.setColor([200, 70, 10]);
        newEmbed.setTitle('EMPATE!');
    } else if(game.botResult > game.total && game.botResult <= 21 || game.total > 21) {
        newEmbed.setColor([110, 35, 35]);
        newEmbed.setTitle('O bot venceu!');
    } else {
        newEmbed.setColor([35, 110, 35]);
        newEmbed.setTitle(`${msg.author.username} venceu!`);
    }

    newEmbed.addField('Pontuação do bot: ', game.botResult);
    newEmbed.addField(`Pontuação de ${msg.author.username}`, game.total);

    msg.reply(newEmbed);
}