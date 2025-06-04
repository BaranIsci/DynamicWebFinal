const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const flightController = require('../controllers/flightController');
const ticketController = require('../controllers/ticketController');
const auth = require('../middleware/auth');
const { City } = require('../models');

// Admin routes
router.post('/auth/login', adminController.login);
router.post('/admin/create', auth, adminController.createAdmin);

// City routes
router.get('/city', async (req, res) => {
  try {
    const cities = await City.findAll({
      attributes: ['city_id', 'city_name'],
      order: [['city_name', 'ASC']]
    });
    res.json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ message: 'Error fetching cities' });
  }
});

// Flight routes
router.get('/flights', flightController.getAllFlights);
router.get('/flights/search', flightController.searchFlights);
router.post('/flights', auth, flightController.createFlight);
router.put('/flights/:id', auth, flightController.updateFlight);
router.put('/flights/:id/seats', flightController.updateFlightSeats);
router.delete('/flights/:id', auth, flightController.deleteFlight);

// Ticket routes
router.get('/tickets', ticketController.getAllTickets);
router.post('/tickets', ticketController.createTicket);
router.put('/tickets/:id', ticketController.updateTicket);
router.delete('/tickets/:id', ticketController.deleteTicket);

module.exports = router; 