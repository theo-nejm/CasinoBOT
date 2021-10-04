module.exports = (amount, player1, player2) => {
  if(player1.balance < amount) return `você não tem saldo suficiente para esse desafio.`;
  if(player2 && player2.balance < amount) return `${player2.name} não tem saldo suficiente para esse desafio.`;
  if(amount < 0) return `você não pode apostar um valor negativo.`;
  if(String(amount).includes('.') || !Number(amount)) return `você só pode apostar valores inteiros.`;
  if(typeof amount !== 'number') return `você deve apostar um valor numérico.`;
}