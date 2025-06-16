const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  passenger_name: {
    type: String,
    required: true
  },
  passenger_surname: {
    type: String,
    required: true
  },
  passenger_email: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  flight_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flight',
    required: true
  },
  seat_number: {
    type: String
  },
  booking_date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Ticket', ticketSchema); 