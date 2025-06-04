const { Ticket, Flight, City } = require('../models');
const { v4: uuidv4 } = require('uuid');

const ticketController = {
  // Get all tickets
  getAllTickets: async (req, res) => {
    try {
      const tickets = await Ticket.findAll({
        include: [{
          model: Flight,
          include: [
            {
              model: City,
              as: 'departureCity',
              attributes: ['city_name']
            },
            {
              model: City,
              as: 'arrivalCity',
              attributes: ['city_name']
            }
          ]
        }]
      });
      res.json(tickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      res.status(500).json({ message: 'Error fetching tickets' });
    }
  },

  // Create ticket
  createTicket: async (req, res) => {
    try {
      const { passenger_name, passenger_surname, passenger_email, flight_id, seat_number } = req.body;

      // Validate required fields
      if (!passenger_name || !passenger_surname || !passenger_email || !flight_id) {
        return res.status(400).json({ 
          message: 'Missing required fields: passenger_name, passenger_surname, passenger_email, flight_id' 
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(passenger_email)) {
        return res.status(400).json({ 
          message: 'Invalid email format' 
        });
      }

      // Check if flight exists and has available seats
      const flight = await Flight.findByPk(flight_id);
      if (!flight) {
        return res.status(404).json({ 
          message: 'Flight not found' 
        });
      }

      if (flight.seats_available <= 0) {
        return res.status(400).json({ 
          message: 'No seats available for this flight' 
        });
      }

      // Create ticket
      const ticket = await Ticket.create({
        passenger_name,
        passenger_surname,
        passenger_email,
        flight_id,
        seat_number
      });

      // Update available seats
      await flight.update({
        seats_available: flight.seats_available - 1
      });

      res.status(201).json(ticket);
    } catch (error) {
      console.error('Error creating ticket:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          message: error.errors.map(err => err.message).join(', ') 
        });
      }
      res.status(400).json({ 
        message: 'Error creating ticket: ' + error.message 
      });
    }
  },

  // Update ticket
  updateTicket: async (req, res) => {
    try {
      const ticket = await Ticket.findByPk(req.params.id);
      if (!ticket) {
        return res.status(404).json({ 
          message: 'Ticket not found' 
        });
      }

      await ticket.update(req.body);
      res.json(ticket);
    } catch (error) {
      console.error('Error updating ticket:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          message: error.errors.map(err => err.message).join(', ') 
        });
      }
      res.status(400).json({ 
        message: 'Error updating ticket: ' + error.message 
      });
    }
  },

  // Delete ticket
  deleteTicket: async (req, res) => {
    try {
      const ticket = await Ticket.findByPk(req.params.id);
      if (!ticket) {
        return res.status(404).json({ 
          message: 'Ticket not found' 
        });
      }

      // Get the flight to update available seats
      const flight = await Flight.findByPk(ticket.flight_id);
      if (flight) {
        await flight.update({
          seats_available: flight.seats_available + 1
        });
      }

      await ticket.destroy();
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting ticket:', error);
      res.status(500).json({ 
        message: 'Error deleting ticket: ' + error.message 
      });
    }
  },

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