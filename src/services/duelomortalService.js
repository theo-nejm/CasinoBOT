const { QueryTypes } = require('sequelize');
const sequelize = require('../config/db');
const getPlayerByDcId = require('./getPlayerByDcId');

module.exports = async (id1, id2) => {
  try {
    const player1 = await getPlayerByDcId(id1);
    const player2 = await getPlayerByDcId(id2);
  
    const updateQuery = `UPDATE players 
                          SET balance = ${player1.balance + player2.balance} 
                          WHERE id = ${id1};`
                          
    const deleteQuery = `DELETE FROM players WHERE id = ${id2}`;
  
    await sequelize.query(updateQuery, { type: QueryTypes.UPDATE });
    await sequelize.query(deleteQuery, { type: QueryTypes.DELETE });
  
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}