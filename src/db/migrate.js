const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

async function runMigrations() {
  try {
    console.log('🔄 Ejecutando migraciones...');

    // 1️⃣ Crear tabla de control si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        run_on TIMESTAMPTZ DEFAULT now()
      );
    `);

    // 2️⃣ Obtener migraciones ya ejecutadas
    const { rows } = await pool.query('SELECT name FROM migrations');
    const executed = rows.map(r => r.name);

    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir).sort();

    for (const file of files) {
      if (!executed.includes(file)) {
        console.log(`📦 Ejecutando: ${file}`);

        const sql = fs.readFileSync(
          path.join(migrationsDir, file),
          'utf8'
        );

        await pool.query(sql);

        await pool.query(
          'INSERT INTO migrations(name) VALUES($1)',
          [file]
        );

        console.log(`✅ ${file} ejecutado`);
      }
    }

    console.log('🚀 Migraciones completadas');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en migraciones:', error);
    process.exit(1);
  }
}

runMigrations();