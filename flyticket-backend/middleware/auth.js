const jwt = require('jsonwebtoken');
const { Admin } = require('../models');

const auth = (req, res, next) => {
  // Simulate authentication
  next();
};

module.exports = auth; 