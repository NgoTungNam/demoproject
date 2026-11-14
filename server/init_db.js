require('dotenv').config();
const db = require('./db');
const { initializeSchema } = require('./schema');

initializeSchema()
  .then(() => console.log('Database schema initialized.'))
  .catch(error => {
    console.error('Database initialization failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => db.end());
