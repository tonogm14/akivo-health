require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const pool = require('../db');

async function checkTables() {
    try {
        const { rows } = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
        console.log('Tables:', rows.map(r => r.table_name));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
checkTables();
