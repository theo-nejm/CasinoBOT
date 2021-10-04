const { MessageEmbed } = require("discord.js");
const decreaseAmount = require("../services/decreaseAmount");
const getPlayerByDcId = require("../services/getPlayerByDcId");
const increaseAmount = require("../services/increaseAmount");
const randomInArray = require("../utils/randomInArray");
const randomInt = require("../utils/randomInt");
const duelomortalService = require("../services/duelomortalService");
const verifyAmount = require("../utils/verifyAmount");

module.exports = async msg => {
    const params = msg.content.replace(`${process.env.PREFIX}dado`, '').trim().split(' ');

    if(msg.mentions.users.size === 0) {
        const player = await getPlayerByDcId(msg.author.id);
        const amount = Number(params[0].trim());

        const amountInvalidMessage = verifyAmount(amount, player); 
        if(amount && amountInvalidMessage) return msg.reply(amountInvalidMessage);

        const game = {
            isAgainstBot: true,
            player1: {
                total: randomInt(1, 7),
                name: player.name,
                id: player.id,
            },
            player2: {
                total: randomInt(1, 7),
                name: 'CasinoBOT',
                id: 1,
            },
            amount: amount || 0,
        }

        const embed = new MessageEmbed()
                                .setTitle('O jogo acabou!')

                            if (game.player1.total > game.player2.total) {
                               embed.setColor([50, 220, 50]);
                               embed.setDescription(`${game.player1.name} venceu de ${game.player2.name}, ganhando $${game.amount},00!`);
                               increaseAmount(game.player1.id, game.amount);
                            } else if (game.player2.total > game.player1.total) {
                               embed.setColor([50, 220, 50])
                               embed.setDescription(`${game.player2.name} venceu de ${game.player2.name}, ganhando $${game.amount},00!`)
                               decreaseAmount(game.player1.id, game.amount);
                            } else {
                                embed.setColor([250, 250, 50])
                                embed.setDescription(`EMPATE!`)
                            }

                            embed.addField(`Número de ${game.player1.name}: `, game.player1.total, true);
                            embed.addField(`Número de ${game.player2.name}: `, game.player2.total, true);

                            msg.channel.send(embed);
    } else {
        const player1 = await getPlayerByDcId(msg.author.id);
        const player2 = await getPlayerByDcId(msg.mentions.users.first().id);
        const amount = Number(params[1].trim());

        if(!player2) {
            msg.reply('a pessoa que você desafiou não está no jogo ainda. Fala pra ela entrar! $entrar');
            return;
        }

        const amountInvalidMessage = verifyAmount(amount, player1, player2); 
        if(amount && amountInvalidMessage) return msg.reply(amountInvalidMessage);

        const game = {
            amount: amount || 0,
            isAgainstBot: false,
            whoseTurn: 'player1',
            player1: {             
                id: player1.id,
                name: player1.name,
                total: randomInt(1, 7),
            },
            player2: {             
                id: player2.id,
                name: player2.name,
                total: randomInt(1, 7),
            }
        }

        const embed = new MessageEmbed()
            .setColor([35, 23, 45])
            .setTitle('Vai aceitar o desafio?')

        msg.channel.send(`<@${game.player2.id}>, o ${game.player1.name} te desafiou para um jogo de dados. [Você tem 30s para aceitar]`)
            .then(embedMsg => {
                const possibleReactions = ['✅', '❌']

                possibleReactions.forEach((reaction, user) => embedMsg.react(reaction));

                const filter = (reaction, user) => {
                    return possibleReactions.includes(reaction.emoji.name) && user.id === game.player2.id;
                }

                embedMsg.awaitReactions(filter, { max: 1, time: 30000, errors: ['time'] })
                    .then(reactions => {
                        const reaction = reactions.first();
                        
                        const choosenOption = possibleReactions.indexOf(reaction.emoji.name);

                        if(choosenOption === 0) {
                            const embed = new MessageEmbed()
                                .setTitle('O jogo acabou!')

                            if (game.player1.total > game.player2.total) {
                               embed.setColor([50, 220, 50]);
                               embed.setDescription(`${game.player1.name} venceu de ${game.player2.name}, ganhando $${game.amount},00!`);
                               increaseAmount(game.player1.id, game.amount);
                               decreaseAmount(game.player2.id, game.amount);
                            } else if (game.player2.total > game.player1.total) {
                               embed.setColor([50, 220, 50])
                               embed.setDescription(`${game.player2.name} venceu de ${game.player2.name}, ganhando $${game.amount},00!`)
                               increaseAmount(game.player2.id, game.amount);
                               decreaseAmount(game.player1.id, game.amount);
                            } else {
                                embed.setColor([250, 250, 50])
                                embed.setDescription(`EMPATE!`)
                            }

                            embed.addField(`Número de ${game.player1.name}: `, game.player1.total, true);
                            embed.addField(`Número de ${game.player2.name}: `, game.player2.total, true);

                            msg.channel.send(embed);
                        } else {
                            msg.channel.send(`<@${game.player1.id}>, ${game.player2.name} rejeitou seu desafio.`);
                        }
                    }).catch(e => {
                        console.log(e);
                        msg.channel.send(`Infelizmente, <@${game.player1.id}>, o tempo de aceitar/rejeitar o desafio expirou.`);
                    })
        });
    }
}
