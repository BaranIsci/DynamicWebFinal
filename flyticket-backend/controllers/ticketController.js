const { Ticket, Flight } = require('../models');
const mongoose = require('mongoose');

const ticketController = {
  // Get all tickets
  getAllTickets: async (req, res) => {
    try {
      const tickets = await Ticket.find()
        .populate('flight_id');
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
      const flight = await Flight.findById(flight_id);
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
      const ticket = new Ticket({
        passenger_name,
        passenger_surname,
        passenger_email,
        flight_id,
        seat_number
      });

      await ticket.save();

      // Update available seats
      flight.seats_available -= 1;
      await flight.save();

      const createdTicket = await Ticket.findById(ticket._id)
        .populate('flight_id');

      res.status(201).json(createdTicket);
    } catch (error) {
      console.error('Error creating ticket:', error);
      res.status(400).json({ 
        message: 'Error creating ticket: ' + error.message 
      });
    }
  },

  // Update ticket
  updateTicket: async (req, res) => {
    try {
      const ticket = await Ticket.findById(req.params.id);
      if (!ticket) {
        return res.status(404).json({ 
          message: 'Ticket not found' 
        });
      }

      Object.assign(ticket, req.body);
      await ticket.save();

      const updatedTicket = await Ticket.findById(ticket._id)
        .populate('flight_id');

      res.json(updatedTicket);
    } catch (error) {
      console.error('Error updating ticket:', error);
      res.status(400).json({ 
        message: 'Error updating ticket: ' + error.message 
      });
    }
  },

  // Delete ticket
  deleteTicket: async (req, res) => {
    try {
      const ticket = await Ticket.findById(req.params.id);
      if (!ticket) {
        return res.status(404).json({ 
          message: 'Ticket not found' 
        });
      }

      // Get the flight to update available seats
      const flight = await Flight.findById(ticket.flight_id);
      if (flight) {
        flight.seats_available += 1;
        await flight.save();
      }

      await ticket.deleteOne();
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
  },

  // Get tickets by flight ID
  getTicketsByFlightId: async (req, res) => {
    try {
      const { flightId } = req.params;
      console.log('Searching for tickets with flightId:', flightId);

      // Ensure flightId is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(flightId)) {
        return res.status(400).json({ message: 'Invalid flight ID format' });
      }

      // Find tickets using MongoDB query
      const tickets = await Ticket.find({ flight_id: flightId })
        .populate({
          path: 'flight_id',
          select: 'from_city to_city departure_time arrival_time price'
        });

      console.log('Found tickets:', tickets);

      if (!tickets || tickets.length === 0) {
        return res.status(404).json({ message: 'No tickets found for this flight' });
      }

      res.json(tickets);
    } catch (error) {
      console.error('Error fetching tickets by flight ID:', error);
      res.status(500).json({ 
        message: 'Error fetching tickets by flight ID',
        error: error.message 
      });
    }
  }
};

module.exports = ticketController; 