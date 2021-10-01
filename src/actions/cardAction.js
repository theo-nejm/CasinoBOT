const { MessageEmbed } = require("discord.js");
const decreaseAmount = require("../services/decreaseAmount");
const getPlayerByDcId = require("../services/getPlayerByDcId");
const increaseAmount = require("../services/increaseAmount");
const randomInArray = require("../utils/randomInArray");
const randomInt = require("../utils/randomInt");


module.exports = async msg => {
    const params = msg.content.replace(`${process.env.PREFIX}card`, '').split(' ');
    const amount = Number(params[1]);

    if(msg.mentions.users.size === 0) {
        const player = await getPlayerByDcId(msg.author.id);

        if(player.balance < amount) {
            msg.reply(`você não pode apostar um valor maior que o que você tem. Seu saldo é $${player.balance},00`);
            return;
        }
    
        if(amount < 0) {
            msg.reply('você não pode apostar um valor negativo.');
            return;
        }
    
        const game = {
            isRunning: true,
            round: 0,
            total: 0,
            botResult: randomInt(10, 16) + randomInt(0, 12),
            amount
        }
    
        chooseCard(msg, game);
    } else {
        const player1 = await getPlayerByDcId(msg.author.id);

        const player2 = await getPlayerByDcId(msg.mentions.users.first().id);

        if(!player2) {
            msg.reply('a pessoa que você desafiou não está no jogo ainda. Fala pra ela entrar! $entrar');
            return;
        }

        if(player1.balance < amount) {
            msg.reply(`você não pode apostar um valor maior que o que você tem. Seu saldo é: $${player1.balance},00`);
            return;
        } 
        
        if (player2.balance < amount) {
            msg.reply(`você não pode apostar um valor maior que o saldo do seu oponente. O saldo dele é: $${player2.balance},00`);
            return;
        }

        const embed = new MessageEmbed()
            .setColor([35, 23, 45])
            .setTitle('Vai aceitar o desafio?')
        
        msg.channel.send(`<@${player2.id}>, o ${player1.name} te desafiou para um blackjack. [Você tem 30s para aceitar]`)
            .then(embedMsg => {
                const possibleReactions = ['✅', '❌']

                possibleReactions.forEach((reaction, user) => embedMsg.react(reaction));

                const filter = (reaction, user) => {
                    return possibleReactions.includes(reaction.emoji.name) && user.id === player2.id;
                }

                embedMsg.awaitReactions(filter, { max: 1, time: 30000, errors: ['time'] })
                    .then(reactions => {
                        const reaction = reactions.first();
                        
                        const choosenOption = possibleReactions.indexOf(reaction.emoji.name);
                        
                        if(choosenOption === 0) {
                            chooseCard(msg, game);
                        } else {
                            msg.channel.send(`<@${player1.id}>, ${player2.name} rejeitou seu desafio.`);
                        }
                    }).catch(e => {
                        console.log(e);
                        msg.channel.send(`Infelizmente, <@${player1.id}>, o tempo de aceitar/rejeitar o desafio expirou.`);
                    })
        });   
    }

    /* -> informações q chegam no mention
    {
      id: '559454945062158368',
      system: null,
      locale: null,
      flags: [UserFlags],
      username: 'F4',
      bot: false,
      discriminator: '3210',
      avatar: '4bee16b84d06c5fad56d29fe323553ed',
      lastMessageID: null,
      lastMessageChannelID: null
    }
    */

    // msg instanceof Message (discord.js)
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

    if(game.round === 1) {
        embed.setTitle(`${msg.author.username}, bem-vindo ao blackjack! Você está jogando contra um bot!`);
        embed.addField('Você recebeu um:', `${carta} de ${naipe}!`, true);
        embed.addField('Pontuação total:', game.total, true);
    } else {
        embed.addField('Você recebeu um:', `${carta} de ${naipe}!`, true);
        embed.addField('Pontuação total:', game.total, true);
    }
        
        
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

async function finishGame(msg, game) {
    const newEmbed = new MessageEmbed();

    game.isRunning = false;

    if(game.botResult > 21 && game.playerResult > 21 || game.botResult == game.total) {
        newEmbed.setColor([200, 70, 10]);
        newEmbed.setTitle('EMPATE!');
    } else if(game.botResult > game.total && game.botResult <= 21 || game.total > 21) {
        if(await decreaseAmount(msg.author.id, game.amount)) {
            newEmbed.setColor([110, 35, 35]);
            newEmbed.setTitle('O bot venceu!');
            newEmbed.setFooter(`${msg.author.username}, você perdeu $${game.amount},00`);
        } else {
            newEmbed.setColor([65, 23, 45]);
            newEmbed.setTitle('Ocorreu um erro.')
        }
    } else {
        if(await increaseAmount(msg.author.id, game.amount)) {
            newEmbed.setColor([35, 110, 35]);
            newEmbed.setTitle(`${msg.author.username} venceu!`);
            newEmbed.setFooter(`${msg.author.username}, você ganhou $${game.amount},00`);
        } else {
            newEmbed.setColor([65, 23, 45]);
            newEmbed.setTitle('Ocorreu um erro.')
        }
    }

    newEmbed.addField('Pontuação do bot: ', game.botResult);
    newEmbed.addField(`Pontuação de ${msg.author.username}`, game.total);

    msg.reply(newEmbed);
}