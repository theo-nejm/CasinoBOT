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

    game[game.whoseTurn].total += cardValue;

    game.round += 1;

    const embed = new MessageEmbed()
        .setColor([35, 23, 45])

    if(game.round === 1) {
        embed.setTitle(`${msg.author.username}, bem-vindo ao blackjack! Você está jogando contra ${game.isAgainstBot ? 'um bot' : game.player2.name}!`);
        embed.addField('Você recebeu um:', `${carta} de ${naipe}!`, true);
        embed.addField('Pontuação total:', game.player1.total, true);
    } else {
        embed.addField(`${game[game.whoseTurn].name} recebeu um:`, `${carta} de ${naipe}!`, true);
        embed.addField('Pontuação total:', game[game.whoseTurn].total, true);

        if(game[game.whoseTurn].total >= 21) {
            finishGame(msg, game); 
            msg.channel.send(embed);
            return;
        }
    }
        
    msg.channel.send(embed).then(embedMsg => {
        const possibleReactions = ['🃏', '❌'];

        possibleReactions.forEach((reaction) => embedMsg.react(reaction));

        const filter = (reaction, user) => {
            return possibleReactions.includes(reaction.emoji.name) && user.id === game[game.whoseTurn].id;
        }

        embedMsg.awaitReactions(filter, { max: 1, time: 15000, errors: ['time'] })
            .then(reactions => {
                const reaction = reactions.first();
                
                const choosenOption = possibleReactions.indexOf(reaction.emoji.name);
                
                if(choosenOption === 0) {
                    if(!game.isAgainstBot) game.whoseTurn = game.whoseTurn === 'player1' ? 'player2' : 'player1';

                    if(game[game.whoseTurn].isFinished) game.whoseTurn = game.whoseTurn === 'player1' ? 'player2' : 'player1';
                    chooseCard(msg, game);
                } else {
                    game[game.whoseTurn].isFinished = true;

                    if(game.isAgainstBot && game.player1.isFinished) {
                        finishGame(msg, game);
                        return;
                    }

                    if(game.player1.isFinished && game.player2.isFinished) {
                        finishGame(msg, game);
                        return;
                    } else {
                        game.whoseTurn = game.whoseTurn === 'player1' ? 'player2' : 'player1';
                        chooseCard(msg, game);
                    }
                }
            })
    })
}

async function finishGame(msg, game) {
    const newEmbed = new MessageEmbed();

    game.isRunning = false;

    if(game.player2.total > 21 && game.player1.total > 21 || game.player1.total == game.player2.total) {
        newEmbed.setColor([200, 70, 10]);
        newEmbed.setTitle('EMPATE!');
    } else if((game.player2.total > game.player1.total && game.player2.total <= 21) || game.player1.total > 21) {
        if(await decreaseAmount(msg.author.id, game.amount)) {
            !game.isAgainstBot && await increaseAmount(game.player2.id, game.amount);

            newEmbed.setColor([110, 35, 35]);
            newEmbed.setTitle(`${game.player2.name} venceu!`);
            newEmbed.addField(`${game.player2.name}, você ganhou`, `$${game.amount},00`);
            newEmbed.addField(`${game.player1.name}, você perdeu`, `$${game.amount},00`);
        } else {
            newEmbed.setColor([65, 23, 45]);
            newEmbed.setTitle('Ocorreu um erro.');
        }
    } else {
        if(await increaseAmount(msg.author.id, game.amount)) {
            !game.isAgainstBot && await decreaseAmount(game.player2.id, game.amount);
            
            newEmbed.setColor([35, 110, 35]);
            newEmbed.setTitle(`${game.player1.name} venceu!`);
            newEmbed.addField(`${game.player1.name}, você ganhou`, `$${game.amount},00`);
            newEmbed.addField(`${game.player2.name}, você perdeu`, `$${game.amount},00`);
        } else {
            newEmbed.setColor([65, 23, 45]);
            newEmbed.setTitle('Ocorreu um erro.')
        }
    }

    newEmbed.addField(`Pontuação de ${game.player1.name}: `, game.player1.total, true);
    newEmbed.addField(`Pontuação de ${game.player2.name}: `, game.player2.total, true);

    msg.reply(newEmbed);
}