const Sequelize = require('sequelize');
const sequelize = new Sequelize('casino', 'casino', 'casino', {
  host: 'localhost',
  dialect: 'mysql',
});

module.exports = sequelize;