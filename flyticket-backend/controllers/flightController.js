const { Flight, City } = require('../models');
const mongoose = require('mongoose');

const flightController = {
  // Get all flights
  getAllFlights: async (req, res) => {
    try {
      const flights = await Flight.find()
        .populate('from_city', 'city_name')
        .populate('to_city', 'city_name');
      res.json(flights);
    } catch (error) {
      console.error('Error fetching flights:', error);
      res.status(500).json({ message: 'Error fetching flights' });
    }
  },

  // Get all cities for dropdown
  getCities: async (req, res) => {
    try {
      const cities = await City.find().sort({ city_name: 1 });
      res.json(cities);
    } catch (error) {
      console.error('Error fetching cities:', error);
      res.status(500).json({ message: 'Error fetching cities' });
    }
  },

  // Search flights
  searchFlights: async (req, res) => {
    try {
      const { from_city, to_city, departure_date, arrival_date } = req.query;
      
      // Build query based on provided parameters
      const query = {};
      
      if (from_city) {
        const fromCity = await City.findOne({ city_name: from_city });
        if (fromCity) {
          query.from_city = fromCity._id;
        }
      }
      
      if (to_city) {
        const toCity = await City.findOne({ city_name: to_city });
        if (toCity) {
          query.to_city = toCity._id;
        }
      }
      
      if (departure_date) {
        const startDate = new Date(departure_date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        
        query.departure_time = {
          $gte: startDate,
          $lt: endDate
        };
      }
      
      if (arrival_date) {
        const startDate = new Date(arrival_date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        
        query.arrival_time = {
          $gte: startDate,
          $lt: endDate
        };
      }

      const flights = await Flight.find(query)
        .populate('from_city', 'city_name')
        .populate('to_city', 'city_name');
      
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
      const fromCity = await City.findById(req.body.from_city);
      const toCity = await City.findById(req.body.to_city);

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

      if (fromCity._id.toString() === toCity._id.toString()) {
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

      // Before creating the flight, check for duplicate departure
      const existingDepartureFlight = await Flight.findOne({
        from_city: fromCity._id,
        departure_time: departureTime
      });
      if (existingDepartureFlight) {
        return res.status(400).json({
          message: 'A flight with the same departure city and time already exists.'
        });
      }

      // Check for duplicate arrival
      const existingArrivalFlight = await Flight.findOne({
        to_city: toCity._id,
        arrival_time: arrivalTime
      });
      if (existingArrivalFlight) {
        return res.status(400).json({
          message: 'A flight with the same arrival city and time already exists.'
        });
      }

      // Create flight with converted values
      const flight = new Flight({
        from_city: fromCity._id,
        to_city: toCity._id,
        departure_time: departureTime,
        arrival_time: arrivalTime,
        price,
        seats_total: seatsTotal,
        seats_available: seatsAvailable
      });

      await flight.save();
      
      // Fetch the created flight with city information
      const createdFlight = await Flight.findById(flight._id)
        .populate('from_city', 'city_name')
        .populate('to_city', 'city_name');
      
      res.status(201).json(createdFlight);
    } catch (error) {
      console.error('Error creating flight:', error);
      res.status(400).json({ 
        message: 'Error creating flight: ' + error.message 
      });
    }
  },

  // Update flight (admin only)
  updateFlight: async (req, res) => {
    try {
      const flight = await Flight.findById(req.params.id);
      if (!flight) {
        return res.status(404).json({ message: 'Flight not found' });
      }

      // Validate city existence if cities are being updated
      if (req.body.from_city || req.body.to_city) {
        const fromCity = req.body.from_city ? await City.findById(req.body.from_city) : null;
        const toCity = req.body.to_city ? await City.findById(req.body.to_city) : null;

        if ((req.body.from_city && !fromCity) || (req.body.to_city && !toCity)) {
          return res.status(400).json({ message: 'Invalid city ID' });
        }
      }

      // Before updating the flight, check for duplicate departure
      const excludeId = new mongoose.Types.ObjectId(req.params.id);
      const normalizedDeparture = normalizeDateToMinute(req.body.departure_time);
      const normalizedArrival = normalizeDateToMinute(req.body.arrival_time);

      const existingDepartureFlight = await Flight.findOne({
        from_city: req.body.from_city,
        departure_time: normalizedDeparture,
        _id: { $ne: excludeId }
      });
      if (existingDepartureFlight) {
        return res.status(400).json({
          message: 'A flight with the same departure city and time already exists.'
        });
      }

      // Check for duplicate arrival
      const existingArrivalFlight = await Flight.findOne({
        to_city: req.body.to_city,
        arrival_time: normalizedArrival,
        _id: { $ne: excludeId }
      });
      if (existingArrivalFlight) {
        return res.status(400).json({
          message: 'A flight with the same arrival city and time already exists.'
        });
      }

      Object.assign(flight, req.body);
      await flight.save();
      
      const updatedFlight = await Flight.findById(flight._id)
        .populate('from_city', 'city_name')
        .populate('to_city', 'city_name');
        
      res.json(updatedFlight);
    } catch (error) {
      console.error('Error updating flight:', error);
      res.status(400).json({ message: 'Error updating flight: ' + error.message });
    }
  },

  // Delete flight (admin only)
  deleteFlight: async (req, res) => {
    try {
      const flight = await Flight.findById(req.params.id);
      if (!flight) {
        return res.status(404).json({ message: 'Flight not found' });
      }
      await flight.deleteOne();
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting flight:', error);
      res.status(500).json({ message: 'Error deleting flight' });
    }
  },

  // Update flight seats (public)
  updateFlightSeats: async (req, res) => {
    try {
      const flight = await Flight.findById(req.params.id);
      if (!flight) {
        return res.status(404).json({ message: 'Flight not found' });
      }

      const { seats_available } = req.body;
      if (typeof seats_available !== 'number' || seats_available < 0 || seats_available > flight.seats_total) {
        return res.status(400).json({ 
          message: 'Invalid seats_available value. Must be a number between 0 and total seats.' 
        });
      }

      flight.seats_available = seats_available;
      await flight.save();
      
      const updatedFlight = await Flight.findById(flight._id)
        .populate('from_city', 'city_name')
        .populate('to_city', 'city_name');
        
      res.json(updatedFlight);
    } catch (error) {
      console.error('Error updating flight seats:', error);
      res.status(400).json({ message: 'Error updating flight seats' });
    }
  }
};

function normalizeDateToMinute(date) {
  const d = new Date(date);
  d.setSeconds(0, 0);
  return d;
}

module.exports = flightController; 