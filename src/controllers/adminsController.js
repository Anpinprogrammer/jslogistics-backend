const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

// GET /api/admins
const getAll = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.email, u.full_name, u.created_at, p.phone
       FROM users u
       INNER JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE ur.role = 'admin'
       ORDER BY u.full_name`
    );

    res.json({ data: result.rows, error: null });
  } catch (error) {
    console.error('Error obteniendo administradores:', error);
    res.status(500).json({ error: 'Error al obtener administradores' });
  }
};

// POST /api/admins - Create a new admin
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
      `INSERT INTO users (email, password_hash, full_name, phone)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, full_name, created_at`,
      [email, passwordHash, full_name, phone || null]
    );
    const user = userResult.rows[0];

    await pool.query(
      `INSERT INTO user_roles (user_id, role) VALUES ($1, 'admin')`,
      [user.id]
    );

    await pool.query(
      `INSERT INTO profiles (user_id, full_name, phone) VALUES ($1, $2, $3)`,
      [user.id, full_name, phone || null]
    );

    res.status(201).json({
      data: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: phone || null,
        created_at: user.created_at,
        role: 'admin',
      },
      error: null,
    });
  } catch (error) {
    console.error('Error creando administrador:', error);
    res.status(500).json({ error: 'Error al crear administrador' });
  }
};

// PUT /api/admins/:id - Update admin profile and optionally password
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone, password } = req.body;

    if (!full_name) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    // Verify it's actually an admin
    const existing = await pool.query(
      `SELECT u.id FROM users u
       INNER JOIN user_roles ur ON u.id = ur.user_id
       WHERE u.id = $1 AND ur.role = 'admin'`,
      [id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Administrador no encontrado' });
    }

    await pool.query(
      `UPDATE users SET full_name = $1, phone = $2 WHERE id = $3`,
      [full_name, phone || null, id]
    );

    const profileResult = await pool.query(
      `UPDATE profiles SET full_name = $1, phone = $2, updated_at = NOW()
       WHERE user_id = $3 RETURNING *`,
      [full_name, phone || null, id]
    );

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      await pool.query(
        `UPDATE users SET password_hash = $1 WHERE id = $2`,
        [passwordHash, id]
      );
    }

    const updatedResult = await pool.query(
      `SELECT u.id, u.email, u.full_name, u.created_at, p.phone
       FROM users u LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [id]
    );

    res.json({ data: updatedResult.rows[0], error: null });
  } catch (error) {
    console.error('Error actualizando administrador:', error);
    res.status(500).json({ error: 'Error al actualizar administrador' });
  }
};

// DELETE /api/admins/:id
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
    }

    // Ensure at least one admin remains
    const adminCount = await pool.query(
      `SELECT COUNT(*) FROM user_roles WHERE role = 'admin'`
    );
    if (parseInt(adminCount.rows[0].count) <= 1) {
      return res.status(400).json({ error: 'Debe existir al menos un administrador' });
    }

    const existing = await pool.query(
      `SELECT u.id FROM users u
       INNER JOIN user_roles ur ON u.id = ur.user_id
       WHERE u.id = $1 AND ur.role = 'admin'`,
      [id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Administrador no encontrado' });
    }

    await pool.query('DELETE FROM user_roles WHERE user_id = $1', [id]);
    await pool.query('DELETE FROM profiles WHERE user_id = $1', [id]);
    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    res.json({ data: { deleted: true }, error: null });
  } catch (error) {
    console.error('Error eliminando administrador:', error);
    res.status(500).json({ error: 'Error al eliminar administrador' });
  }
};

module.exports = { getAll, create, update, remove };
