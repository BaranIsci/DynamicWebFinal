const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Ticket = sequelize.define('Ticket', {
    ticket_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'flights',
        key: 'flight_id'
      }
    },
    seat_number: {
      type: DataTypes.STRING,
      allowNull: true
    },
    booking_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.ENUM('confirmed', 'cancelled', 'completed'),
      allowNull: false,
      defaultValue: 'confirmed'
    }
  }, {
    tableName: 'tickets',
    timestamps: true
  });
  return Ticket;
}; 