const { QueryTypes } = require('sequelize');
const sequelize = require('../config/db');

module.exports = async discord_id => {
  const sql = `SELECT lastRouletteWithdraw FROM players WHERE id = ${discord_id};`
  const [ { lastRouletteWithdraw } ] = await sequelize.query(sql, { type: QueryTypes.SELECT });

  if(!lastRouletteWithdraw) return false;

  const cdDate = new Date(lastRouletteWithdraw).getTime();
  const now = new Date().getTime();

  const timePast = now - cdDate;

  if(timePast > 32400000) return false;
  else return 32400000 - timePast;
}