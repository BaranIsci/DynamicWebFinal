const { Flight } = require('../models');
const { Op } = require('sequelize');

const flightController = {
  // Get all flights
  getAllFlights: async (req, res) => {
    try {
      const flights = await Flight.findAll();
      res.json(flights);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Search flights
  searchFlights: async (req, res) => {
    try {
      const { from_city, to_city, date } = req.query;
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      const flights = await Flight.findAll({
        where: {
          from_city,
          to_city,
          departure_time: {
            [Op.between]: [startDate, endDate]
          }
        }
      });
      res.json(flights);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  },

  // Create flight (admin only)
  createFlight: async (req, res) => {
    try {
      const flight = await Flight.create(req.body);
      res.status(201).json(flight);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Update flight (admin only)
  updateFlight: async (req, res) => {
    try {
      const flight = await Flight.findByPk(req.params.id);
      if (!flight) {
        return res.status(404).json({ error: 'Flight not found' });
      }
      await flight.update(req.body);
      res.json(flight);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete flight (admin only)
  deleteFlight: async (req, res) => {
    try {
      const flight = await Flight.findByPk(req.params.id);
      if (!flight) {
        return res.status(404).json({ error: 'Flight not found' });
      }
      await flight.destroy();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = flightController; 