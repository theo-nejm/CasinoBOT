const { MessageEmbed } = require("discord.js");
const getPlayerByDcId = require("../services/getPlayerByDcId")

module.exports = async msg => {
  const player = await getPlayerByDcId(msg.author.id);
  const embed = new MessageEmbed()
    .setColor([120, 120, 200])
    .setAuthor('CasinoBANK')
    .addField('Seu nome: ', player.name, true)
    .addField('Seu saldo: ', `$${player.balance},00`, true)
    .setFooter(`No jogo desde: ${new Date(player.createdAt).toLocaleDateString('pt-BR')}`);

    msg.reply(embed);
}