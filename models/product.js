const Sequelize = require('sequelize');
const {DataTypes} = Sequelize
const sequelize = require('../util/database');

const Product = sequelize.define('product', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  title: DataTypes.STRING,
  price: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  brand:{
   type:DataTypes.STRING,
   allowNull:true 
  },
  country:{
    type:DataTypes.STRING,
    allowNull:true
  },
  size:{
    type:DataTypes.STRING,
    allowNull:true
  }
});

module.exports = Product;
