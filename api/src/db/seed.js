#!/usr/bin/env node
// Seed: demo doctors + one test user
require('dotenv').config();
const pool = require('../db');

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Demo doctors (Huancayo, zona Hospital Daniel Alcides Carrión)
    const doctors = [
      { name: 'Dr. Amilcar Marcano', cmp: 'CMP 99999', specialty: 'Medicina General', exp: 10, lat: -12.0648, lng: -75.2111 },
      { name: 'Ana Morales',         cmp: 'CMP 54821', specialty: 'Medicina General',  exp: 8,  lat: -12.0648, lng: -75.2111 },
      { name: 'Carlos Huamán',       cmp: 'CMP 41093', specialty: 'Medicina Familiar', exp: 12, lat: -12.0655, lng: -75.2095 },
      { name: 'Sofía Quispe',        cmp: 'CMP 62101', specialty: 'Pediatría',         exp: 6,  lat: -12.0638, lng: -75.2125 },
      { name: 'Miguel Torres',       cmp: 'CMP 38820', specialty: 'Medicina General',  exp: 15, lat: -12.0662, lng: -75.2078 },
    ];

    for (const d of doctors) {
      await client.query(
        `INSERT INTO doctors (name, cmp_license, specialty, experience_years, is_available, latitude, longitude, rating, total_reviews)
         VALUES ($1, $2, $3, $4, TRUE, $5, $6, $7, $8)
         ON CONFLICT (cmp_license) DO NOTHING`,
        [d.name, d.cmp, d.specialty, d.exp, d.lat, d.lng, (4.7 + Math.random() * 0.3).toFixed(2), Math.floor(300 + Math.random() * 700)]
      );
    }

    // Test user
    await client.query(
      `INSERT INTO users (phone, name) VALUES ($1, $2) ON CONFLICT (phone) DO NOTHING`,
      ['+51999999999', 'Usuario Demo']
    );

    await client.query('COMMIT');
    console.log('✅ Seed complete');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
