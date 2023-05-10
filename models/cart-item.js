const Sequelize = require('sequelize');
const {DataTypes} = Sequelize
const sequelize = require('../util/database');

const CartItem = sequelize.define('cartItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  quantity: Sequelize.INTEGER
});

module.exports = CartItem;
