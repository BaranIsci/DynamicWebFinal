const adminController = {
  login: async (req, res) => {
    res.json({ message: 'Admin login endpoint' });
  },
  createAdmin: async (req, res) => {
    res.json({ message: 'Admin creation endpoint' });
  }
};

module.exports = adminController; 