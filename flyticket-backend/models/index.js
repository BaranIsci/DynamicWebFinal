const connectDB = require('../db');
const Flight = require('./Flight');
const Ticket = require('./Ticket');
const City = require('./City');
const Admin = require('./Admin');

// Initialize database connection
connectDB();

const db = {
  Flight,
  Ticket,
  City,
  Admin
};

module.exports = db; 