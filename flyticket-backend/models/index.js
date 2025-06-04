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

db.Flight = Flight;
db.Ticket = Ticket;

// Set up associations
Ticket.belongsTo(Flight, { foreignKey: 'flight_id' });

// Sync database
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database synced successfully');
  })
  .catch((err) => {
    console.error('Error syncing database:', err);
  });

module.exports = db; 