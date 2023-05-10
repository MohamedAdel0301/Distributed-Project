const Sequelize = require('sequelize');
const {DataTypes} = Sequelize
const sequelize = require('../util/database');
const User = sequelize.define('user', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name:{
    type:DataTypes.STRING,
    allowNull:true
  },
  email: {
    type:DataTypes.STRING,
    allowNull:false
  },
  password: {
    type:DataTypes.STRING,
    allowNull:false
  },
  balance:{
    type:DataTypes.DOUBLE,
    defaultValue: 0
  },
  type:{
    type:DataTypes.BOOLEAN,
    defaultValue:0
  }
});

module.exports = User;
