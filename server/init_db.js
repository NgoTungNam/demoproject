const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Uses the same variables as server/db.js, so it works both locally and in
// Railway's MySQL service.
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'euroasia_db',
  port: Number(process.env.DB_PORT || 3306),
  multipleStatements: true,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

const schemaPath = path.join(__dirname, '..', 'database_schema.md');
const schemaContent = fs.readFileSync(schemaPath, 'utf8');
const sqlBlocks = schemaContent.match(/```sql([\s\S]*?)```/g) || [];
const fullSql = sqlBlocks.map((block) => block.replace(/```sql|```/g, '')).join('\n');

console.log('Initializing database schema...');

connection.connect((connectError) => {
  if (connectError) {
    console.error('Database connection failed:', connectError.message);
    process.exit(1);
  }

  connection.query(fullSql, (queryError) => {
    if (queryError) {
      // Tables already being present is safe on later deploys. The payment
      // migration is run afterwards and remains idempotent.
      console.error('Schema initialization warning:', queryError.message);
    } else {
      console.log('Database schema and sample data initialized.');
    }
    connection.end();
  });
});
