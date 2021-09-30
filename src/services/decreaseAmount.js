const { QueryTypes } = require('sequelize');
const sequelize = require('../config/db');
const getPlayerByDcId = require('./getPlayerByDcId');

module.exports = async (discord_id, amount) => {
  try {
    const player = await getPlayerByDcId(discord_id);

    const sql = `UPDATE players 
                  SET balance = ${player.balance -= amount} 
                  WHERE id = ${player.id};`;
    
    await sequelize.query(sql, { type: QueryTypes.UPDATE });
    
    return true;
  } catch (e) {
    return false;
  }
}