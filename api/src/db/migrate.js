const fs = require('fs');
const path = require('path');
const pool = require('../db');

async function migrate() {
    console.log('🚀 Iniciando migración de base de datos...');

    const client = await pool.connect();
    try {
        // 1. Crear tabla de control si no existe
        await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        filename TEXT UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // 2. Leer archivos de la carpeta migrations
        const migrationsDir = path.join(__dirname, 'migrations');
        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort(); // Orden lexicográfico (001, 002...)

        // 3. Obtener migraciones ya aplicadas
        const { rows } = await client.query('SELECT filename FROM _migrations');
        const appliedFiles = new Set(rows.map(r => r.filename));

        // 4. Ejecutar las faltantes
        for (const file of files) {
            if (!appliedFiles.has(file)) {
                console.log(`➡️  Aplicando: ${file}`);
                const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

                await client.query('BEGIN');
                try {
                    await client.query(sql);
                    await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
                    await client.query('COMMIT');
                    console.log(`✅ ${file} aplicado con éxito.`);
                } catch (err) {
                    await client.query('ROLLBACK');
                    console.error(`❌ Error en ${file}:`, err.message);
                    throw err;
                }
            }
        }

        console.log('🎉 Migraciones completadas.');
    } catch (err) {
        console.error('💥 Error crítico durante la migración:', err.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
