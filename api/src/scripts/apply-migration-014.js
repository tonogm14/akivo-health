const pool = require('../db');
const fs = require('fs');
const path = require('path');

async function run() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, '../db/migrations/014_full_doctors_profile.sql'), 'utf8');
        await pool.query(sql);
        console.log('Migration 014 applied successfully');
        process.exit(0);
    } catch (err) {
        console.error('Error applying migration:', err);
        process.exit(1);
    }
}

run();
