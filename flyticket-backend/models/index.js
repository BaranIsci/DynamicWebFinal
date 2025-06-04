const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/flyticket', {
  dialect: 'postgres',
  logging: false
});

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Initialize models
const Flight = require('./Flight')(sequelize);
const Ticket = require('./Ticket')(sequelize);
const City = require('./City')(sequelize);
const Admin = require('./Admin')(sequelize);

db.Flight = Flight;
db.Ticket = Ticket;
db.City = City;
db.Admin = Admin;

// Set up associations
Ticket.belongsTo(Flight, { foreignKey: 'flight_id' });
Flight.belongsTo(City, { foreignKey: 'from_city', as: 'departureCity' });
Flight.belongsTo(City, { foreignKey: 'to_city', as: 'arrivalCity' });

// Sync database with force: true to recreate tables
sequelize.sync({ alter: true })
  .then(async () => {
    console.log('Database synced successfully');
    // Create default admin user if it doesn't exist
    try {
      const adminExists = await Admin.findOne({ where: { username: 'admin' } });
      if (!adminExists) {
        await Admin.create({
          username: 'admin',
          password: 'baranimo24'
        });
        console.log('Default admin user created');
      }
    } catch (error) {
      console.error('Error creating default admin:', error);
    }
  })
  .catch((err) => {
    console.error('Error syncing database:', err);
  });

module.exports = db; 