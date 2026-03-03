const { pool } = require('../config/database');
require('dotenv').config();

async function seedDatabase() {
  try {
    console.log('🌱 Ejecutando seeds...');

    const adminCheck = await pool.query(
      "SELECT COUNT(*) FROM user_roles WHERE role = 'admin'"
    );

    if (parseInt(adminCheck.rows[0].count) === 0) {
      console.log('📝 Creando usuario admin...');

      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash('admin123', 10);

      const userResult = await pool.query(
        `INSERT INTO users (email, password_hash, full_name) 
         VALUES ($1, $2, $3) 
         RETURNING id`,
        ['admin@cargoguardian.com', passwordHash, 'Administrador']
      );

      const userId = userResult.rows[0].id;

      await pool.query(
        `INSERT INTO user_roles (user_id, role) VALUES ($1, 'admin')`,
        [userId]
      );

      await pool.query(
        `INSERT INTO profiles (user_id, full_name) VALUES ($1, $2)`,
        [userId, 'Administrador']
      );

      console.log('✅ Admin creado');
    }

    console.log('🌱 Seeds listos');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seeds:', error);
    process.exit(1);
  }
}

seedDatabase();