const jwt = require('jsonwebtoken');
const { Admin } = require('../models');

const adminController = {
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      // Find admin by username
      const admin = await Admin.findOne({ where: { username } });
      if (!admin) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      // Validate password
      const isValidPassword = await admin.validatePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: admin.id, username: admin.username },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({ token });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  createAdmin: async (req, res) => {
    try {
      const { username, password } = req.body;
      const admin = await Admin.create({ username, password });
      res.status(201).json({ message: 'Admin created successfully' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};

module.exports = adminController; 