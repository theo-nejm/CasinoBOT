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
            isAgainstBot: true,
            whoseTurn: 'player1',
            player1: {
                total: 0,
                name: player.name,
                id: player.id,
            },
            player2: {
                total: randomInt(12, 16) + randomInt(0, 11),
                name: 'CasinoBOT',
                id: 1,
            },
            amount: amount || 0,
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

        const game = {
            isRunning: true,
            round: 0,
            amount: amount || 0,
            isAgainstBot: false,
            whoseTurn: 'player1',
            player1: {
                total: 0,
                id: player1.id,
                name: player1.name,
                isFinished: false,
            },
            player2: {
                total: 0,
                id: player2.id,
                name: player2.name,
                isFinished: false,
            }
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
                            const playersduelo = [player1.name, player2.name];
                            





                        } else {
                            msg.channel.send(`<@${player1.id}>, ${player2.name} rejeitou seu desafio.`);
                        }
                    }).catch(e => {
                        console.log(e);
                        msg.channel.send(`Infelizmente, <@${player1.id}>, o tempo de aceitar/rejeitar o desafio expirou.`);
                    })
        });
    }
}

function chooseCard(msg, game) {
    if(!game.isRunning) return;


    
}