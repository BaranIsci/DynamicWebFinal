const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const City = sequelize.define('City', {
    city_id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    city_name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'city',
    timestamps: false
  });
  return City;
}; 