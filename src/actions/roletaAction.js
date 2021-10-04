const { MessageEmbed } = require("discord.js");
const checkRouletteCooldown = require("../services/checkRouletteCooldown");
const getPlayerByDcId = require("../services/getPlayerByDcId");
const roleta = require("../services/roleta");
const randomInt = require("../utils/randomInt");

module.exports = async msg => {
  const cd = await checkRouletteCooldown(msg.author.id);

  if(!cd) {
    const premios = {
      casa: 50,
      celular: 50,
      moto: 100,
      quad: 100,
      carro: 200,
      bitcoin: 200,
      shaodre: 500,
    }

    const premioIndex = randomInt(0, Object.keys(premios).length);
    const premioName = Object.keys(premios)[premioIndex];
    const amount = Object.values(premios)[premioIndex];
    
    if(await roleta(msg.author.id, amount)) msg.channel.send(`Voce ganhou um(a) ${premioName} de $${amount},00! Volte em 6H para rodar a roleta novamente.`);
    else msg.channel.send('Aconteceu um erro.')
  } else {
    const cdDate = new Date(cd);
    msg.reply(`você precisa aguardar ${cdDate.getHours()}h${cdDate.getMinutes()}m para roletar novamente.`);
  }
}
