require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const pool = require('../db');
const fs = require('fs');
const path = require('path');

async function migrate() {
    const sql = fs.readFileSync(path.join(__dirname, '../db/migrations/007_admin_auth.sql'), 'utf8');
    try {
        await pool.query(sql);
        console.log('✅ Migration 007 applied');
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
    } finally {
        process.exit();
    }
}
migrate();
