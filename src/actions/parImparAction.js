const { MessageEmbed } = require("discord.js");
const randomInArray = require("../utils/randomInArray");
const randomInt = require("../utils/randomInt");


module.exports = msg => {
    const game = {
      isRunning: true,
      bolasPlayer: 10,
      bolasBot: 10,
    }

    playerTime(msg, game);
}

function playerTime(msg, game) {
    const botChooseOdd = randomInArray([true, false]);

    const embed = new MessageEmbed()
        .setColor([35, 23, 45])
        .setTitle('Escolha um número: ')
        .setDescription('penis')
        
    msg.channel.send(embed).then(embedMsg => {
        const possibleReactions = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟']

        possibleReactions.forEach((reaction, user) => embedMsg.react(reaction));

        const filter = (reaction, user) => {
            return possibleReactions.includes(reaction.emoji.name) && user.id === msg.author.id;
        }

        embedMsg.awaitReactions(filter, { max: 1, time: 15000, errors: ['time'] })
            .then(reactions => {
                const reaction = reactions.first();
                const newEmbed = new MessageEmbed();

                const choosenOption = possibleReactions.indexOf(reaction.emoji.name) + 1;
                const isOdd = choosenOption % 2 === 0;

                if(isOdd && botChooseOdd){
                    game.bolasBot += choosenOption;
                    game.bolasPlayer -= choosenOption;
                    newEmbed.setColor([35, 110, 35]);
                    newEmbed.setTitle(`${msg.author.username} perdeu ${choosenOption} bolas!`);
                    isFinishGame(msg, game);
                } else {
                    game.bolasBot -= choosenOption;
                    game.bolasPlayer += choosenOption;
                    newEmbed.setColor([35, 110, 35]);
                    newEmbed.setTitle(`${msg.author.username} ganhou ${choosenOption} bolas!`);
                    isFinishGame(msg, game);
                }

        })
    })
}


async function isFinishGame(msg, game) {
    const newEmbed = new MessageEmbed();

    if (game.bolasPlayer <= 0 || game.bolasBot <= 0){
        game.isRunning = false;
    }else{
        game.isRunning = true;
    }

    if(!game.isRunning) {
        if(game.bolasPlayer > game.bolasBot){
            newEmbed.addField(`${msg.author.username} venceu!`);
        }else{
            newEmbed.addField(`Bot venceu!`);
        }
        
        msg.reply(newEmbed);
    }else{
        console.log('continua essa porra')
        playerTime(msg, game)
    }

    
}