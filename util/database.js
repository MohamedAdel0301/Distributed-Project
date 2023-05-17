const Sequelize = require('sequelize');

const sequelize = new Sequelize('project', 'root', 'a1b1c1d1e1', {
  dialect: 'mariadb',
  host: '127.0.0.1',
  logging:false,
  port:3306
});

module.exports = sequelize;
