const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Flight = sequelize.define('Flight', {
    flight_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    from_city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    to_city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    departure_time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    arrival_time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    seats_total: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    seats_available: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    timestamps: true
  });
  return Flight;
}; 