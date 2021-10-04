const { MessageEmbed } = require("discord.js");
const decreaseAmount = require("../services/decreaseAmount");
const getPlayerByDcId = require("../services/getPlayerByDcId");
const increaseAmount = require("../services/increaseAmount");
const randomInArray = require("../utils/randomInArray");
const randomInt = require("../utils/randomInt");
const duelomortalService = require("../services/duelomortalService");

module.exports = async msg => {
    const player1 = await getPlayerByDcId(msg.author.id);
    const player2 = await getPlayerByDcId(msg.mentions.users.first().id);

    if(msg.mentions.users.size === 0) {
        msg.reply('você precisa desafiar alguém para o duelo mortal.');
        return;
    }

    if(!player2) {
        msg.reply('a pessoa que você desafiou não está no jogo ainda. Fala pra ela entrar usando o $entrar!');
        return;
    }

    const embed = new MessageEmbed()
        .setColor([35, 23, 45])
        .setTitle('Vai aceitar o desafio?')
    
    msg.channel.send(`<@${player2.id}>, o ${player1.name} te desafiou para um Duelo Mortal. [Você tem 30s para aceitar]`)
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
                        const playersduelo = [player1, player2];
                        const vencedor = randomInArray(playersduelo);
                        msg.channel.send(`Vencedor: ${vencedor.name}`)

                        duelomortalService(vencedor.id, playersduelo.find(player => player.id !== vencedor.id).id);
                    } else {
                        msg.channel.send(`<@${player1.id}>, ${player2.name} rejeitou seu desafio.`);
                    }
                }).catch(e => {
                    console.log(e);
                    msg.channel.send(`Infelizmente, <@${player1.id}>, o tempo de aceitar/rejeitar o desafio expirou.`);
                })
    });
}
