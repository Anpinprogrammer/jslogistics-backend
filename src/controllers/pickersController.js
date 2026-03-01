const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

// NOTE: The 'picker' role must exist in the app_role enum before using this controller.
// Run this migration once on the database:
//   ALTER TYPE app_role ADD VALUE 'picker';

// GET /api/pickers
const getAll = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.user_id, p.full_name, p.phone
       FROM profiles p
       INNER JOIN user_roles ur ON p.user_id = ur.user_id
       WHERE ur.role = 'picker'
       ORDER BY p.full_name`
    );
    res.json({ data: result.rows, total: result.rows.length, error: null });
  } catch (error) {
    console.error('Error obteniendo patinadores:', error);
    res.status(500).json({ error: 'Error al obtener patinadores' });
  }
};

// POST /api/pickers
const create = async (req, res) => {
  try {
    const { email, password, full_name, phone } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, contraseña y nombre son requeridos' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userResult = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, phone) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name`,
      [email, passwordHash, full_name, phone || null]
    );
    const user = userResult.rows[0];

    await pool.query(
      `INSERT INTO user_roles (user_id, role) VALUES ($1, 'picker')`,
      [user.id]
    );

    await pool.query(
      `INSERT INTO profiles (user_id, full_name, phone) VALUES ($1, $2, $3)`,
      [user.id, full_name, phone || null]
    );

    res.status(201).json({
      data: {
        id: user.id,
        user_id: user.id,
        full_name,
        phone: phone || null,
        role: 'picker',
      },
      error: null,
    });
  } catch (error) {
    console.error('Error creando patinador:', error);
    res.status(500).json({ error: 'Error al crear patinador' });
  }
};

// PUT /api/pickers/:id
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone, password } = req.body;

    if (!full_name) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    const result = await pool.query(
      `UPDATE profiles SET full_name = $1, phone = $2, updated_at = NOW()
       WHERE user_id = $3 RETURNING *`,
      [full_name, phone || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patinador no encontrado' });
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      await pool.query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [passwordHash, id]);
    }

    res.json({ data: result.rows[0], error: null });
  } catch (error) {
    console.error('Error actualizando patinador:', error);
    res.status(500).json({ error: 'Error al actualizar patinador' });
  }
};

// DELETE /api/pickers/:id
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await pool.query(
      `SELECT p.user_id FROM profiles p
       INNER JOIN user_roles ur ON p.user_id = ur.user_id
       WHERE p.user_id = $1 AND ur.role = 'picker'`,
      [id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Patinador no encontrado' });
    }

    await pool.query(`UPDATE pickups SET courier_id = NULL WHERE courier_id = $1`, [id]);
    await pool.query(`DELETE FROM user_roles WHERE user_id = $1`, [id]);
    await pool.query(`DELETE FROM profiles WHERE user_id = $1`, [id]);
    await pool.query(`DELETE FROM users WHERE id = $1`, [id]);

    res.json({ data: { deleted: true }, error: null });
  } catch (error) {
    console.error('Error eliminando patinador:', error);
    res.status(500).json({ error: 'Error al eliminar patinador' });
  }
};

module.exports = { getAll, create, update, remove };
