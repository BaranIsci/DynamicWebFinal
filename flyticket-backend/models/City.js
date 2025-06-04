const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const City = sequelize.define('City', {
    city_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    city_name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    timestamps: false
  });
  return City;
}; 