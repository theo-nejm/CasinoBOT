const Sequelize = require('sequelize');
const db = require('../config/db');

const Player = db.define('player', {
  id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  balance: {
    type: Sequelize.DOUBLE,
    allowNull: false,
  },
  lastRouletteWithdraw: {
    type: Sequelize.DATE,
    allowNull: true,
  }
})

module.exports = Player;