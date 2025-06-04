const { Ticket, Flight } = require('../models');
const { v4: uuidv4 } = require('uuid');

const ticketController = {
  // Book a ticket
  bookTicket: async (req, res) => {
    res.json({ message: 'Book ticket endpoint' });
  },

  // Get tickets by email
  getTicketsByEmail: async (req, res) => {
    res.json({ message: 'Get tickets by email endpoint' });
  },

  // Get all tickets (admin only)
  getAllTickets: async (req, res) => {
    res.json({ message: 'Get all tickets endpoint' });
  }
};

module.exports = ticketController; 