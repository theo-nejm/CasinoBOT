const { MessageEmbed } = require("discord.js");
const Player = require("../models/Player");
const playerExists = require("../services/playerExists");

module.exports = async msg => {
  try {
    if (await playerExists(msg.author.id)) {
      msg.reply(' você já está no jogo.');
      return;
    }

    await Player.create({
      id: msg.author.id,
      name: msg.author.username,
      balance: 100,
    });

    const embed = new MessageEmbed()
      .setAuthor('CasinoBANK')
      .setColor([65, 225, 65])
      .setDescription(msg.author.username + 'você acaba de entrar no jogo!')
      .setFooter('Seu saldo é: $100,00');

    msg.reply(embed);
  } catch (e) {
    console.log(e);
    msg.reply(' não deu pra entrar no jogo.');
  }
}
