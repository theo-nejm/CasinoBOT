const { MessageEmbed } = require("discord.js");
const getPlayerByDcId = require("../services/getPlayerByDcId")

module.exports = async msg => {
  const player = await getPlayerByDcId(msg.author.id);
  
  const params = msg.content.replace(`${process.env.PREFIX}ajuda`, '').trim().split(' ');
  const category = params[0];
  const subcategory = params[1];

  const validCategories = [
    'game',
    'roleta',
    'perfil',
    'entrar'
  ]

  const stringValidCategories = validCategories.join(', ');

  const validGames = [
    'card',
    'dado',
    'duelomortal'
  ]

  const embed = new MessageEmbed()
    .setColor([120, 120, 200])
    .setAuthor('AJUDA!')
    .setTitle('Aqui você pode ver os comandos e como usá-los.')
    .addField('$ajuda', 'Mostra para você os comandos básicos e um pouco de como usá-los.', false)
    .addField('$ajuda <categoria> (ex.: $ajuda game)', 'Mostra para você os comandos básicos da categoria escolhida.', false)
    .addField('$ajuda <categoria> <subcategoria> (ex.: $ajuda game card)', 'Explica como funciona a subcategoria, no caso do exemplo, o jogo.', false)
    .setDescription('\n**Categorias**: ' + stringValidCategories + '.')
    
    if(category) {
      if(!validCategories.includes(category)) {
        embed.addField('Você precisa selecionar uma categoria válida', `Categorias: ${stringValidCategories}.`);
      }else{
        switch(category) {
            case 'perfil':
                embed.addField('game explanation', '.');
                break;
            case 'roleta':
                embed.addField('dado explanation', '.');
                break;
            case 'game':
                embed.addField('game explanation', '.');
                break;
            case 'entrar':
                embed.addField('entrar explanation', '.');
                break;
        }
    }
    }

    if(subcategory) {
        if(!validGames.includes(subcategory)) {
            embed.addField('você precisa selecionar um jogo válido.')
        } else{
            switch(subcategory) {
                case 'card':
                    embed.addField('card explanation', '.');
                    break;
                case 'dado':
                    embed.addField('dado explanation', '.');
                    break;
            }
        }

    }

    msg.channel.send(embed);
}