const { Flight, City } = require('../models');
const { Op } = require('sequelize');

const flightController = {
  // Get all flights
  getAllFlights: async (req, res) => {
    try {
      const flights = await Flight.findAll({
        include: [
          {
            model: City,
            as: 'departureCity',
            attributes: ['city_id', 'city_name']
          },
          {
            model: City,
            as: 'arrivalCity',
            attributes: ['city_id', 'city_name']
          }
        ]
      });
      res.json(flights);
    } catch (error) {
      console.error('Error fetching flights:', error);
      res.status(500).json({ message: 'Error fetching flights' });
    }
  },

  // Get all cities for dropdown
  getCities: async (req, res) => {
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
  },

  // Search flights
  searchFlights: async (req, res) => {
    try {
      const { from_city, to_city, date } = req.query;
      
      // Build where clause based on provided parameters
      const whereClause = {};
      
      if (from_city) {
        whereClause.from_city = parseInt(from_city);
      }
      
      if (to_city) {
        whereClause.to_city = parseInt(to_city);
      }
      
      if (date) {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);
        
        whereClause.departure_time = {
          [Op.between]: [startDate, endDate]
        };
      }

      const flights = await Flight.findAll({
        where: whereClause,
        include: [
          {
            model: City,
            as: 'departureCity',
            attributes: ['city_id', 'city_name']
          },
          {
            model: City,
            as: 'arrivalCity',
            attributes: ['city_id', 'city_name']
          }
        ]
      });
      
      res.json(flights);
    } catch (error) {
      console.error('Error searching flights:', error);
      res.status(500).json({ message: 'Error searching flights' });
    }
  },

  // Create flight (admin only)
  createFlight: async (req, res) => {
    try {
      // Log the incoming request body
      console.log('Creating flight with data:', req.body);

      // Validate required fields
      const requiredFields = ['from_city', 'to_city', 'departure_time', 'arrival_time', 'price', 'seats_total', 'seats_available'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({ 
          message: `Missing required fields: ${missingFields.join(', ')}` 
        });
      }

      // Validate city existence
      const fromCity = await City.findOne({ where: { city_id: req.body.from_city } });
      const toCity = await City.findOne({ where: { city_id: req.body.to_city } });

      if (!fromCity) {
        return res.status(400).json({ 
          message: `Departure city with ID '${req.body.from_city}' not found in the database` 
        });
      }

      if (!toCity) {
        return res.status(400).json({ 
          message: `Arrival city with ID '${req.body.to_city}' not found in the database` 
        });
      }

      if (fromCity.city_id === toCity.city_id) {
        return res.status(400).json({ 
          message: 'Departure and arrival cities cannot be the same' 
        });
      }

      // Validate dates
      const departureTime = new Date(req.body.departure_time);
      const arrivalTime = new Date(req.body.arrival_time);

      if (isNaN(departureTime.getTime())) {
        return res.status(400).json({ 
          message: 'Invalid departure time format. Please use ISO 8601 format (e.g., 2024-03-20T10:00:00Z)' 
        });
      }

      if (isNaN(arrivalTime.getTime())) {
        return res.status(400).json({ 
          message: 'Invalid arrival time format. Please use ISO 8601 format (e.g., 2024-03-20T10:00:00Z)' 
        });
      }

      if (arrivalTime <= departureTime) {
        return res.status(400).json({ 
          message: 'Arrival time must be after departure time' 
        });
      }

      // Convert and validate numeric fields
      const price = parseFloat(req.body.price);
      const seatsTotal = parseInt(req.body.seats_total);
      const seatsAvailable = parseInt(req.body.seats_available);

      console.log('Numeric field validation:', {
        original: {
          price: req.body.price,
          seatsTotal: req.body.seats_total,
          seatsAvailable: req.body.seats_available
        },
        parsed: {
          price,
          seatsTotal,
          seatsAvailable
        }
      });

      if (isNaN(price) || price <= 0) {
        return res.status(400).json({ 
          message: 'Price must be a positive number' 
        });
      }

      if (isNaN(seatsTotal) || seatsTotal <= 0) {
        return res.status(400).json({ 
          message: `Total seats must be a positive integer. Received: ${req.body.seats_total}, Parsed: ${seatsTotal}` 
        });
      }

      if (isNaN(seatsAvailable) || seatsAvailable < 0) {
        return res.status(400).json({ 
          message: 'Available seats must be a non-negative integer' 
        });
      }

      if (seatsAvailable > seatsTotal) {
        return res.status(400).json({ 
          message: 'Available seats cannot be greater than total seats' 
        });
      }

      // Create flight with converted values
      const flight = await Flight.create({
        from_city: fromCity.city_id,
        to_city: toCity.city_id,
        departure_time: departureTime,
        arrival_time: arrivalTime,
        price,
        seats_total: seatsTotal,
        seats_available: seatsAvailable
      });
      
      // Fetch the created flight with city information
      const createdFlight = await Flight.findByPk(flight.flight_id, {
        include: [
          {
            model: City,
            as: 'departureCity',
            attributes: ['city_id', 'city_name']
          },
          {
            model: City,
            as: 'arrivalCity',
            attributes: ['city_id', 'city_name']
          }
        ]
      });
      
      res.status(201).json(createdFlight);
    } catch (error) {
      console.error('Error creating flight:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          message: error.errors.map(err => err.message).join(', ') 
        });
      }
      res.status(400).json({ 
        message: 'Error creating flight: ' + error.message 
      });
    }
  },

  // Update flight (admin only)
  updateFlight: async (req, res) => {
    try {
      const flight = await Flight.findByPk(req.params.id);
      if (!flight) {
        return res.status(404).json({ message: 'Flight not found' });
      }

      // Validate city existence if cities are being updated
      if (req.body.from_city || req.body.to_city) {
        const fromCity = req.body.from_city ? await City.findByPk(req.body.from_city) : null;
        const toCity = req.body.to_city ? await City.findByPk(req.body.to_city) : null;

        if ((req.body.from_city && !fromCity) || (req.body.to_city && !toCity)) {
          return res.status(400).json({ message: 'Invalid city ID' });
        }
      }

      await flight.update(req.body);
      res.json(flight);
    } catch (error) {
      console.error('Error updating flight:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(400).json({ message: 'Error updating flight' });
    }
  },

  // Delete flight (admin only)
  deleteFlight: async (req, res) => {
    try {
      const flight = await Flight.findByPk(req.params.id);
      if (!flight) {
        return res.status(404).json({ message: 'Flight not found' });
      }
      await flight.destroy();
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting flight:', error);
      res.status(500).json({ message: 'Error deleting flight' });
    }
  },

  // Update flight seats (public)
  updateFlightSeats: async (req, res) => {
    try {
      const flight = await Flight.findByPk(req.params.id);
      if (!flight) {
        return res.status(404).json({ message: 'Flight not found' });
      }

      const { seats_available } = req.body;
      if (typeof seats_available !== 'number' || seats_available < 0 || seats_available > flight.seats_total) {
        return res.status(400).json({ 
          message: 'Invalid seats_available value. Must be a number between 0 and total seats.' 
        });
      }

      await flight.update({ seats_available });
      res.json(flight);
    } catch (error) {
      console.error('Error updating flight seats:', error);
      res.status(400).json({ message: 'Error updating flight seats' });
    }
  }
};

module.exports = flightController; 