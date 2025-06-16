const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  city_name: {
    type: String,
    required: true
  }
}, {
  timestamps: false
});

module.exports = mongoose.model('City', citySchema); 