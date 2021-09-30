module.exports = msg => {
  const prefix = process.env.PREFIX;
  
  if(msg.content.trim()[0] !== prefix) return true;

  if(msg.author.bot) {
    console.log('mensagem por bot')
    return true;
  } 
}