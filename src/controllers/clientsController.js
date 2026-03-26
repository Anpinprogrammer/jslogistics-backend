const { pool } = require('../config/database');
const paginatedResponse = require('../utils/paginatedResponse')
//const { pool } = require('../config/supabase')

//GET /api/clients (test with pagination)
const getAll = async (req, res) => {
  const { limit, offset, page } = req.pagination;
  
  try {
    //Postgres
    const { rows: [ { count }]} = await pool.query(
      `SELECT COUNT(*) FROM clients`
    )

    const clients = await pool.query(
      `SELECT * FROM clients
       ORDER BY name ASC 
       LIMIT $1 
       OFFSET $2
      `,
      [limit, offset]
    )
    res.json(paginatedResponse(clients.rows, parseInt(count), { page, limit }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/clients/:id
const getById = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clients WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json({ data: result.rows[0], error: null });
  } catch (error) {
    console.error('Error obteniendo cliente:', error);
    res.status(500).json({ error: 'Error al obtener cliente' });
  }
};

// GET /api/clients/with-debt
const getWithDebt = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM clients WHERE balance < 0 ORDER BY balance DESC'
    );
    res.json({ data: result.rows, error: null });
  } catch (error) {
    console.error('Error obteniendo clientes con deuda:', error);
    res.status(500).json({ error: 'Error al obtener clientes con deuda' });
  }
};

//GET /api/clients/daily-summary?date=2026-03-13&page=1&limit=10
const getDailySummary = async (req, res) => {
  const { page, limit, offset } = req.pagination;
  const { date } = req.query;
  const targetDate = date || new Date().toISOString().split('T')[0];
  console.log(targetDate)

  try {
    // Query principal con todos los cálculos en SQL
    const result = await pool.query(`
      SELECT 
        c.id,
        c.name,
        c.phone,
        c.balance,
        c.company,

        -- Total recaudado de destinatarios
        COALESCE(SUM(
          CASE WHEN d.payment_method IN ('cash', 'transfer_to_courier')
          THEN d.received_amount ELSE 0 END
        ), 0) AS total_collected,

        -- Tarifa de servicio (solo entregas completadas)
        COALESCE(SUM(
          CASE WHEN d.status = 'completed'
          THEN d.service_value ELSE 0 END
        ), 0) AS total_services,

        -- Préstamos (completadas o no entregadas)
        COALESCE(SUM(
          CASE WHEN d.status IN ('completed', 'not_delivered_collected')
          THEN d.loan ELSE 0 END
        ), 0) AS total_loans,

        -- Cantidad de entregas hoy
        COUNT(d.id) AS delivery_count,

        -- Array de entregas del día
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', d.id,
              'status', d.status,
              'recipient_name', d.recipient_name,
              'payment_method', d.payment_method,
              'received_amount', d.received_amount,
              'service_value', d.service_value,
              'loan', d.loan,
              'total_to_collect', d.total_to_collect,
              'created_at', d.created_at
            ) ORDER BY d.created_at ASC
          ) FILTER (WHERE d.id IS NOT NULL),
          '[]'
        ) AS deliveries,

        -- Total para paginación
        COUNT(*) OVER() AS total_count

      FROM clients c
      LEFT JOIN deliveries d
        ON d.client_id = c.id
        AND DATE(d.created_at) = $1

      -- Solo clientes con actividad hoy O con balance pendiente
      WHERE c.balance != 0 OR d.id IS NOT NULL

      GROUP BY c.id
      ORDER BY c.name ASC
      LIMIT $2 OFFSET $3
    `, [targetDate, limit, offset]);

    const rows = result.rows;
    const total = parseInt(rows[0]?.total_count ?? 0);
    console.log(total)

    const data = rows.map(row => {
      return ({
      client: {
        id: row.id,
        name: row.name,
        phone: row.phone,
        balance: row.balance,
        company: row.company,
      },
      totalCollected: Number(row.total_collected),
      totalServices:  Number(row.total_services),
      totalLoans:     Number(row.total_loans),
      dailyNet:       Number(row.total_collected) - Number(row.total_services),
      currentBalance: Number(row.balance),
      hasActivityToday: Number(row.delivery_count) > 0,
      deliveries:     row.deliveries,
    })});

    res.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/clients
const create = async (req, res) => {
  try {
    const { name, phone, address, notes, company, identification_number, email } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    const result = await pool.query(
      `INSERT INTO clients (name, phone, address, notes, company, identification_number, email)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, phone || null, address || null, notes || null, company || null, identification_number || null, email || null]
    );

    res.status(201).json({ data: result.rows[0], error: null });
  } catch (error) {
    console.error('Error creando cliente:', error);
    res.status(500).json({ error: 'Error al crear cliente' });
  }
};

// PUT /api/clients/:id
const update = async (req, res) => {
  try {
    const { id } = req.params;

    const allowedFields = [
      'name',
      'phone',
      'address',
      'notes',
      'balance',
      'company',
      'identification_number',
      'email',
      'service_lost_trips',
    ];

    const fields = [];
    const values = [];
    let index = 1;

    for (const field of allowedFields) {
      if (req.body.hasOwnProperty(field)) {
        fields.push(`${field} = $${index}`);
        values.push(req.body[field]); // puede ser valor o null
        index++;
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    const query = `
      UPDATE clients
      SET ${fields.join(', ')},
          updated_at = now()
      WHERE id = $${index}
      RETURNING *
    `;

    values.push(id);

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json({ data: result.rows[0], error: null });
  } catch (error) {
    console.error('Error actualizando cliente:', error);
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
};

// PUT /api/clients
const updateAll = async (req, res) => {
  const { balance, service_lost_trips } = req.body
  try {
    const result = await pool.query(
      `UPDATE clients 
       SET 
        balance = $1,
        service_lost_trips = $2,
       updated_at = now()
      `,
      [ balance, service_lost_trips ]
    );

    

    res.json({ data: result, error: null });
  } catch (error) {
    console.log(error)
  }
}

// DELETE /api/clients/:id
const remove = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM clients WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json({ data: { id: result.rows[0].id }, error: null });
  } catch (error) {
    console.error('Error eliminando cliente:', error);
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
};

// GET /api/clients/:id/statement
const getStatement = async (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, end_date } = req.query;

    // Obtener cliente
    const clientResult = await pool.query('SELECT * FROM clients WHERE id = $1', [id]);
    if (clientResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    const client = clientResult.rows[0];

    // Obtener entregas
    let deliveryQuery = 'SELECT * FROM deliveries WHERE client_id = $1';
    const params = [id];
    let paramCount = 1;

    if (start_date) {
      paramCount++;
      deliveryQuery += ` AND delivery_date >= $${paramCount}`;
      params.push(start_date);
    }
    if (end_date) {
      paramCount++;
      deliveryQuery += ` AND delivery_date <= $${paramCount}`;
      params.push(end_date);
    }

    deliveryQuery += ' ORDER BY delivery_date DESC';
    const deliveriesResult = await pool.query(deliveryQuery, params);
    const deliveries = deliveriesResult.rows;

    // Obtener nombres de mensajeros
    const courierIds = [...new Set(deliveries.map(d => d.courier_id))];
    let courierMap = new Map();
    if (courierIds.length > 0) {
      const profilesResult = await pool.query(
        'SELECT user_id, full_name FROM profiles WHERE user_id = ANY($1)',
        [courierIds]
      );
      courierMap = new Map(profilesResult.rows.map(p => [p.user_id, p.full_name]));
    }

    // Calcular totales
    let totalCollected = 0;
    let totalServices = 0;
    let totalLostTrips = 0;

    const enrichedDeliveries = deliveries.map(d => {
      if (d.status === 'completed' || d.status === 'not_delivered_collected') {
        totalServices += parseFloat(d.service_value) || 0;
        if (d.status === 'not_delivered_collected') {
          totalLostTrips += parseFloat(d.total_to_collect) || 0;
        }
        if (d.payment_method === 'cash' || d.payment_method === 'transfer_to_courier') {
          totalCollected += parseFloat(d.received_amount) || 0;
        }
      }

      return {
        ...d,
        service_value: parseFloat(d.service_value) || 0,
        total_to_collect: parseFloat(d.total_to_collect) || 0,
        received_amount: d.received_amount ? parseFloat(d.received_amount) : null,
        courier_name: courierMap.get(d.courier_id) || 'Desconocido',
      };
    });

    const clientBalance = parseFloat(client.balance) || 0;
    const netFromDeliveries = totalCollected - totalServices - totalLostTrips;
    const combinedBalance = netFromDeliveries - clientBalance;

    const statement = {
      id: client.id,
      name: client.name,
      phone: client.phone,
      address: client.address,
      balance: clientBalance,
      totalCollected,
      totalServices,
      totalLostTrips,
      accountsPayable: combinedBalance > 0 ? combinedBalance : 0,
      accountsReceivable: combinedBalance < 0 ? Math.abs(combinedBalance) : clientBalance > 0 ? clientBalance : 0,
      deliveries: enrichedDeliveries,
    };

    res.json({ data: statement, error: null });
  } catch (error) {
    console.error('Error obteniendo estado de cuenta:', error);
    res.status(500).json({ error: 'Error al obtener estado de cuenta' });
  }
};

// Helper
async function queryWithOrder(table, orderBy) {
  const result = await pool.query(`SELECT * FROM ${table} ORDER BY ${orderBy}`);
  return { data: result.rows };
}

module.exports = { getAll, getById, getWithDebt, getDailySummary, create, update, updateAll, remove, getStatement };
