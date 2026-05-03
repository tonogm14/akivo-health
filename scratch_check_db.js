
const { Pool } = require('pg');
require('dotenv').config({ path: '../api/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/doctorhouse'
});

async function check() {
  try {
    const { rows } = await pool.query('SELECT * FROM visit_patients ORDER BY created_at DESC LIMIT 5');
    console.log(JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

check();
