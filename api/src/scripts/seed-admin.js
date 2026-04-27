require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const pool = require('../db');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
    try {
        // Principal Admin (Full Access)
        const adminHash = await bcrypt.hash('admin123', 12);
        await pool.query(
            `INSERT INTO admins (username, password_hash, name, role, permissions) 
             VALUES ($1, $2, $3, 'admin', '["overview", "apps", "consultations", "doctors", "management"]') 
             ON CONFLICT (username) DO UPDATE SET password_hash = $2, role = 'admin', permissions = '["overview", "apps", "consultations", "doctors", "management"]'`,
            ['admin', adminHash, 'Administrador']
        );

        // Standard User (usr) - Only Candidates by default
        const userHash = await bcrypt.hash('user123', 12);
        await pool.query(
            `INSERT INTO admins (username, password_hash, name, role, permissions) 
             VALUES ($1, $2, $3, 'user', '["apps"]') 
             ON CONFLICT (username) DO UPDATE SET password_hash = $2, role = 'user', permissions = '["apps"]'`,
            ['usr', userHash, 'Operador de Aplicaciones']
        );

        console.log('✅ Admin users updated with permissions:');
        console.log(`   Admin: admin / admin123 (Total Access)`);
        console.log(`   User:  usr   / user123 (Only Candidates)`);
    } catch (err) {
        console.error('❌ Failed to seed admin:', err.message);
    } finally {
        process.exit();
    }
}
seedAdmin();
