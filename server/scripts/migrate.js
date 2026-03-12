const fs = require('fs');
const path = require('path');
const { pool, testConnection } = require('../config/db');

const runMigration = async () => {
  console.log('🚀 Starting database migration...');
  const connected = await testConnection();
  if (!connected) {
    console.error('Cannot run migration — database not connected.');
    process.exit(1);
  }

  const schemaPath = path.join(__dirname, '../../database/schema.sql');
  if (!fs.existsSync(schemaPath)) {
    console.error('Schema file not found at:', schemaPath);
    process.exit(1);
  }

  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(schemaSql);
    await client.query('COMMIT');
    console.log('✅ Database schema created/updated successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

runMigration();
