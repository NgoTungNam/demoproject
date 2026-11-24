require('dotenv').config();
const db = require('./db');
const { initializeSchema } = require('./schema');

initializeSchema()
  .then(() => {
    console.log('Database schema initialized.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Database initialization failed:', error.message);
    process.exit(1);
  });
