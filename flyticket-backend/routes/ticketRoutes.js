const express = require('express');
const ticketController = require('../controllers/ticketController');

const router = express.Router();

router.get('/flight/:flightId', ticketController.getTicketsByFlightId);

module.exports = router; 