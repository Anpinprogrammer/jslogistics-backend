const { pool } = require('../config/database');
const { enviarCuadre } = require('../services/cuadreSheets');
const { getTodayBogota, getWeekDatesBogota } = require('../utils/dateUtils');

// Helper: get current week dates (Saturday to Friday) — delegates to Bogota-aware utility
function getCurrentWeekDates(dateStr) {
  return getWeekDatesBogota(dateStr);
}

// GET /api/daily-settlements
const getAll = async (req, res) => {
  try {
    const { courier_id, date } = req.query;

    let query = `
      SELECT ds.*, p.full_name as courier_name
      FROM daily_settlements ds
      LEFT JOIN profiles p ON ds.courier_id = p.user_id
      WHERE 1=1
    `;
    const params = [];
    let count = 0;

    if (courier_id) {
      count++;
      query += ` AND ds.courier_id = $${count}`;
      params.push(courier_id);
    }
    if (date) {
      count++;
      query += ` AND ds.date = $${count}`;
      params.push(date);
    }

    query += ' ORDER BY ds.date DESC, ds.created_at DESC';

    const result = await pool.query(query, params);
    res.json({ data: result.rows, error: null });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener liquidaciones diarias' });
  }
};

// POST /api/daily-settlements
const create = async (req, res) => {
  try {
    const { courier_id, date, base_money, total_collected, partial_deliveries_sum, expected_balance, actual_balance, difference, is_settled, settled_by, notes } = req.body;

    const result = await pool.query(
      `INSERT INTO daily_settlements (courier_id, date, base_money, total_collected, partial_deliveries_sum, expected_balance, actual_balance, difference, is_settled, settled_by, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [courier_id, date, base_money || 0, total_collected || 0, partial_deliveries_sum || 0, expected_balance || 0, actual_balance || 0, difference || 0, is_settled, settled_by, notes || null]
    );

    res.status(201).json({ data: result.rows[0], error: null });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al crear liquidación diaria' });
  }
};


const settleDailySettlement = async (req, res) => {
  try {
    const { id } = req.params;
    const { actual_balance, notes } = req.body;

    // Validación básica
    if (actual_balance === undefined || actual_balance === null) {
      return res.status(400).json({ error: 'Se requiere el balance real para liquidar' });
    }

    // Obtener liquidación existente
    const existing = await pool.query(
      'SELECT * FROM daily_settlements WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Liquidación no encontrada' });
    }

    const settlement = existing.rows[0];
    const actualVal = Number(actual_balance);
    const expectedVal = Number(settlement.expected_balance ?? 0);
    const difference = actualVal - expectedVal;

    // Actualizar liquidación
    const result = await pool.query(
      `
      UPDATE daily_settlements
      SET actual_balance = $1,
          difference = $2,
          is_settled = true,
          settled_by = $3,
          settled_at = now(),
          notes = COALESCE($4, notes)
      WHERE id = $5
      RETURNING *
      `,
      [actualVal, difference, req.user.id, notes, id]
    );

    const updatedSettlement = result.rows[0];

    // Si hay faltante, crear adelanto de salario
    if (difference < 0) {
      const { weekStart, weekEnd } = getCurrentWeekDates(settlement.date);

      await pool.query(
        `
        INSERT INTO salary_advances
        (courier_id, created_by, amount, reason, week_start, week_end)
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          settlement.courier_id,
          req.user.id,
          Math.abs(difference),
          'Faltante cuadre diario',
          weekStart,
          weekEnd
        ]
      );
    }

    res.json({ data: updatedSettlement, error: null });
  } catch (error) {
    console.error('Error al liquidar:', error);
    res.status(500).json({ error: 'Error al liquidar la liquidación' });
  }
};


// PATCH /api/daily-settlements/:id/settle
// Closes the daily settlement. If there's a shortfall, auto-creates a salary advance.
const settle = async (req, res) => {
  try {
    const { id } = req.params;
    const { actual_balance, notes } = req.body;

    const existing = await pool.query('SELECT * FROM daily_settlements WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Liquidación no encontrada' });
    }

    const settlement = existing.rows[0];
    const actualVal = parseFloat(actual_balance) || 0;
    const expectedVal = parseFloat(settlement.expected_balance);
    const difference = actualVal - expectedVal;

    const result = await pool.query(
      `UPDATE daily_settlements 
       SET actual_balance = $1, difference = $2, is_settled = true, 
           settled_by = $3, settled_at = now(), notes = COALESCE($4, notes)
       WHERE id = $5
       RETURNING *`,
      [actualVal, difference, req.user.id, notes, id]
    );

    // If shortfall, auto-create salary advance
    if (difference < 0) {
      const { weekStart, weekEnd } = getCurrentWeekDates(settlement.date);
      await pool.query(
        `INSERT INTO salary_advances (courier_id, created_by, amount, reason, week_start, week_end)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          settlement.courier_id,
          req.user.id,
          Math.abs(difference),
          'Faltante cuadre diario',
          weekStart,
          weekEnd,
        ]
      );
    }

    res.json({ data: result.rows[0], error: null });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al liquidar' });
  }
};

// PATCH /api/daily-settlements/reopen
// Reopens a settled daily settlement for a courier (e.g. when a new delivery is assigned after closing)
const reopen = async (req, res) => {
  try {
    const { courier_id, date } = req.body;
    const targetDate = date || getTodayBogota();

    const existing = await pool.query(
      'SELECT id FROM daily_settlements WHERE courier_id = $1 AND date = $2 AND is_settled = true',
      [courier_id, targetDate]
    );

    if (existing.rows.length === 0) {
      return res.json({ data: null, message: 'No hay cuadre cerrado para reabrir', error: null });
    }

    const result = await pool.query(
      `UPDATE daily_settlements 
       SET is_settled = false, settled_by = NULL, settled_at = NULL, actual_balance = NULL, difference = NULL
       WHERE id = $1
       RETURNING *`,
      [existing.rows[0].id]
    );

    res.json({ data: result.rows[0], error: null });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al reabrir cuadre' });
  }
};

// GET /api/daily-settlements/get-base-money
const getBaseMoney = async (req, res) => {
  const { date, courierId } = req.query;

  try {
    let query = `
      SELECT *
      FROM daily_base_money
      WHERE date = $1
    `;
    const params = [date];

    if (courierId) {
      query += ` AND courier_id = $2`;
      params.push(courierId);
    }

    const result = await pool.query(query, params);

    res.status(200).json({ data: result.rows });
  } catch (error) {
    console.error('Error obteniendo base money:', error);
    res.status(500).json({ error: 'Error obteniendo base money' });
  }
};

// POST /api/daily-settlements/base-money
const assignBaseMoney = async (req, res) => {
  try {
    const { courier_id, amount, date, notes } = req.body;

    const result = await pool.query(
      `INSERT INTO daily_base_money (courier_id, assigned_by, amount, date, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [courier_id, req.user.id, amount || 0, date || getTodayBogota(), notes || null]
    );

    res.status(201).json({ data: result.rows[0], error: null });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al asignar base' });
  }
};

//PUT /api/daily-settlements/update-courier-base/:id
const updateCourierBase = async (req, res) => {
  const { id } = req.params
  const { amount } = req.body

  try {
    const result = await pool.query(
      `
      UPDATE daily_base_money 
      SET 
        amount = $2
      WHERE courier_id = $1
      `,
      [id, amount]
    )

    res.json({ message: '✅ Base Inicial editado correctamente', updated: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al asignar base' });
  }
}

// POST /api/daily-settlements/partial-delivery
const createPartialDelivery = async (req, res) => {
  try {
    const { courier_id, amount, date, notes } = req.body;

    const result = await pool.query(
      `INSERT INTO partial_deliveries (courier_id, received_by, amount, date, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [courier_id, req.user.id, amount, date || getTodayBogota(), notes || null]
    );

    res.status(201).json({ data: result.rows[0], error: null });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al crear entrega parcial' });
  }
};

// GET /api/daily-settlements/get-partial-deliveries
const getPartialDeliveries = async (req, res) => {
  const { date, courierId } = req.query;

    try {
      let query = `
        SELECT *
        FROM partial_deliveries 
        WHERE date = $1
      `;
      const params = [date];

      if (courierId) {
        query += ` AND courier_id = $2`;
        params.push(courierId);
      }

      const result = await pool.query(query, params);

      res.status(200).json({ data: result.rows });
    } catch (error) {
      console.error('Error obteniendo base money:', error);
      res.status(500).json({ error: 'Error obteniendo entregas parciales' });
    }
}

const deleteDaily = async (req, res) => {
  try {
    await pool.query('DELETE FROM daily_settlements')
    await pool.query('DELETE FROM daily_base_money')
    await pool.query('DELETE FROM partial_deliveries')

    res.json({ msg: 'Eliminado correctamente' })

  } catch (error) { 
    console.log(error)
  }
}

// GET /api/daily-settlements/company
const getAllCompany = async (req, res) => {
  try {
    const result = await pool.query(`
    WITH accounts AS (
    SELECT unnest(ARRAY['cash','bancolombia','nequi'])::company_account AS account
    )
    SELECT
      a.account,
      COALESCE(SUM(CASE WHEN type = 'opening_balance' THEN amount END), 0) AS opening_balance,
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount END), 0) AS total_income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount END), 0) AS total_expense,
      COALESCE(SUM(
        CASE 
          WHEN type = 'opening_balance' THEN amount
          WHEN type = 'income' THEN amount
          WHEN type = 'expense' THEN -amount
        END
      ), 0) AS balance
    FROM accounts a
    LEFT JOIN company_money_movements m
      ON m.account = a.account
    GROUP BY a.account
    ORDER BY a.account;
  `);
    res.json({ data: result.rows })
  } catch (error) {
    console.log(error)
  }
}

//POST /api/daily-settlements/company/money-assignment
const createCompanyAssignment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { account, type, amount, notes, date } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "No user logged in" });
    }

    let result;

    if (type === "opening_balance") {

      result = await pool.query(
        `
        UPDATE company_money_movements
        SET amount = $1,
            notes = $2,
            created_by = $3
        WHERE account = $4
        AND type = 'opening_balance'
        AND date = CURRENT_DATE
        RETURNING *
        `,
        [amount, notes || null, userId, account]
      );

      if (result.rowCount === 0) {
        result = await pool.query(
          `
          INSERT INTO company_money_movements
          (account, type, amount, created_by, date, notes)
          VALUES ($1, 'opening_balance', $2, $3, CURRENT_DATE, $4)
          RETURNING *
          `,
          [account, amount, userId, notes || null]
        );
      }

    } else {

      result = await pool.query(
        `
        INSERT INTO company_money_movements
        (account, type, amount, created_by, date, notes)
        VALUES ($1, $2, $3, $4, CURRENT_DATE, $5)
        RETURNING *
        `,
        [account, type, amount, userId, notes || null]
      );
    }

    const cuadres = result.rows;

    for (const c of cuadres) {
      await enviarCuadre({
        date,
        cuenta: c.account,
        monto: Number(c.amount),
        egresos: 0 // luego lo puedes calcular
      });
    }
    

    res.json(result.rows[0]);

  } catch (error) {
    console.error("Error creando movimiento:", error);
    res.status(500).json({ error: "Error creando movimiento" });
  }
};

//POST /api/daily-settlements/company/reset
const resetCompanyAccounts = async (req, res) => {
  try {
    const userId = req.user?.id; // asegúrate de tener middleware de auth
    if (!userId) {
      return res.status(401).json({ error: 'No user logged in' });
    }

    // 1️⃣ Eliminar todos los registros existentes
    await pool.query(`TRUNCATE TABLE company_money_movements RESTART IDENTITY CASCADE`);

    // 2️⃣ Insertar nuevo opening_balance = 0 para todas las cuentas
    await pool.query(`
      INSERT INTO company_money_movements (account, type, amount, created_by, date, notes)
      SELECT account, 'opening_balance', 0, $1, CURRENT_DATE, 'Reset inicial'
      FROM (
        SELECT unnest(ARRAY['cash','bancolombia','nequi'])::company_account AS account
      ) AS t
    `, [userId]);

    res.json({ message: '✅ Todas las cuentas fueron reseteadas a 0' });
  } catch (error) {
    console.error('Error reseteando cuentas:', error);
    res.status(500).json({ error: 'Error reseteando cuentas' });
  }
};

// GET /api/daily-settlements/company/transactions/:account
const getTransactions = async (req, res) => {
  const { account } = req.params;

  try {
    const userId = req.user?.id;
    if (!userId) return res.status(400).json({ error: 'No user logged in' })

    if(!account) {
      return res.status(400).json({ error: 'Cuenta es requerida' })
    }  

    const targetDate = getTodayBogota();

    const { rows } =  await pool.query(
      `SELECT * FROM company_money_movements
      WHERE account = $1 
      AND date = CURRENT_DATE 
      ORDER BY created_at`,
      [account]
    )

    res.json({ data: rows })
    

  } catch (error) {
    console.error('Error finding transactions:', error);
    res.status(500).json({ error: 'Error encontrando las transacciones' })
  }


}

// PUT /api/daily-settlements/company/movements/opening-balance
const editOpeningBalance = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(400).json({ error: 'No user logged in' })
    
    const { account, newAmount, date } = req.body;
    if(!account || newAmount == null) {
      return res.status(400).json({ error: 'Cuenta y monto son requeridos' })
    }

    const targetDate = date || getTodayBogota();

    // 1️⃣ Verificar si existe un opening_balance para esa cuenta y fecha
    const { rows } = await pool.query(
      `SELECT id FROM company_money_movements
       WHERE account = $1 AND type = 'opening_balance' AND date = CURRENT_DATE`,
      [account]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No se encontro plante inicial para esta cuenta' });
    }

    if (Number(newAmount) === 0) {
      await pool.query(
        `DELETE FROM company_money_movements
         WHERE account = $1
         AND type = 'opening_balance'
         AND date = $2`,
        [account, targetDate]
      );

      return res.json({ message: 'Opening balance eliminado' });
    }

    const idToUpdate = rows[0].id;

    // 2️⃣ Actualizar el amount
    const result = await pool.query(
      `UPDATE company_money_movements
       SET amount = $1, created_by = $2, notes = 'Edited opening_balance', created_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [newAmount, userId, idToUpdate]
    );

    res.json({ message: '✅ Plante Inicial editado correctamente', updated: result.rows[0] });


  } catch (error) {
    console.error('Error editing opening_balance:', error);
    res.status(500).json({ error: 'Error editando el plante inicial' })
  }
}

module.exports = { getAll, create, updateCourierBase, settle, reopen, getBaseMoney, assignBaseMoney, createPartialDelivery, settleDailySettlement, getPartialDeliveries, deleteDaily, getAllCompany, createCompanyAssignment, resetCompanyAccounts, getTransactions, editOpeningBalance };
