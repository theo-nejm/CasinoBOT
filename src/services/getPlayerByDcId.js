const { QueryTypes } = require('sequelize');
const sequelize = require('../config/db');

module.exports = async discord_id => {
  const sql = `SELECT * FROM players WHERE id = ${discord_id};`
  const exists = await sequelize.query(sql, { type: QueryTypes.SELECT });

  return exists.length > 0 ? exists[0] : false;
}