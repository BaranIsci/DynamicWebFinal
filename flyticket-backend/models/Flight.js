const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  from_city: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'City',
    required: true
  },
  to_city: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'City',
    required: true
  },
  departure_time: {
    type: Date,
    required: true
  },
  arrival_time: {
    type: Date,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  seats_total: {
    type: Number,
    required: true
  },
  seats_available: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Flight', flightSchema); 