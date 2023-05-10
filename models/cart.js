const Sequelize = require('sequelize');
const {DataTypes} = Sequelize
const sequelize = require('../util/database');

const Cart = sequelize.define('cart', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  }
});

module.exports = Cart;
