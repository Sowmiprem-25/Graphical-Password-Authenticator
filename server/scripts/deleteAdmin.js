const { pool } = require('../config/db');

async function deleteAdmin() {
  try {
    const res = await pool.query('DELETE FROM users WHERE email = $1 RETURNING *', ['admin@gmail.com']);
    console.log('Deleted users:', res.rowCount);
    console.log('User data:', res.rows[0]);
  } catch (err) {
    console.error('Error deleting user:', err);
  } finally {
    await pool.end();
  }
}

deleteAdmin();
