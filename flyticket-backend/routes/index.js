const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const flightController = require('../controllers/flightController');
const ticketController = require('../controllers/ticketController');
const auth = require('../middleware/auth');

// Admin routes
router.post('/admin/login', adminController.login);
router.post('/admin/create', adminController.createAdmin);

// Flight routes
router.get('/flights', flightController.getAllFlights);
router.get('/flights/search', flightController.searchFlights);
router.post('/flights', auth, flightController.createFlight);
router.put('/flights/:id', auth, flightController.updateFlight);
router.delete('/flights/:id', auth, flightController.deleteFlight);

// Ticket routes
router.post('/tickets', ticketController.bookTicket);
router.get('/tickets/email/:email', ticketController.getTicketsByEmail);
router.get('/tickets', auth, ticketController.getAllTickets);

module.exports = router; 