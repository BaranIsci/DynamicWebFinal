const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Ticket = sequelize.define('Ticket', {
    ticket_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    passenger_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    passenger_surname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    passenger_email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    flight_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    seat_number: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    timestamps: true
  });
  return Ticket;
}; 