const bcrypt = require('bcryptjs');
const pool = require('../db');

async function createRoot() {
    const username = 'agonzalez@akivo.com.pe';
    const name = 'Admin Akivo';
    const tempPass = 'Akivo2024!#'; // Contraseña temporal

    console.log(`🚀 Creando usuario root: ${username}...`);

    try {
        const hash = await bcrypt.hash(tempPass, 10);

        // Insertamos o actualizamos si ya existe
        await pool.query(`
      INSERT INTO admins (username, password_hash, name, role, is_root, is_active)
      VALUES ($1, $2, $3, 'admin', true, true)
      ON CONFLICT (username) 
      DO UPDATE SET 
        password_hash = EXCLUDED.password_hash,
        is_root = true,
        role = 'admin',
        is_active = true
    `, [username, hash, name]);

        console.log('──────────────────────────────────────────────────');
        console.log('✅ USUARIO ROOT CREADO / ACTUALIZADO CON ÉXITO');
        console.log('──────────────────────────────────────────────────');
        console.log(`📧 Usuario: ${username}`);
        console.log(`🔑 Clave Temporal: ${tempPass}`);
        console.log('──────────────────────────────────────────────────');
        console.log('⚠️  Recuerda cambiar tu contraseña al ingresar al panel.');

    } catch (err) {
        console.error('❌ Error creando root:', err.message);
    } finally {
        await pool.end();
    }
}

createRoot();
