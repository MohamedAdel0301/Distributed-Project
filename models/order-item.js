const Sequelize = require('sequelize');
const {DataTypes} = Sequelize
const sequelize = require('../util/database');

const OrderItem = sequelize.define('orderItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  quantity: DataTypes.INTEGER
});

module.exports = OrderItem;
