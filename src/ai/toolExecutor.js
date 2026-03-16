const { pool } = require('../config/database');

// ─── Tool execution ────────────────────────────────────────────────────────────

async function executeTool(toolName, input, userId) {
  const today = new Date().toISOString().split('T')[0];

  switch (toolName) {
    case 'create_delivery': {
      const {
        client_id,
        courier_id,
        amount = 0,
        service_value = 0,
        total_to_collect = 0,
        payment_method = 'cash',
        delivery_date = today,
        notes = null,
        is_pickup = false,
      } = input;

      const result = await pool.query(
        `INSERT INTO deliveries
           (client_id, courier_id, amount, service_value, total_to_collect,
            payment_method, delivery_date, notes, status, created_by,
            week_start, week_end)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending',$9,
           date_trunc('week', $7::date),
           date_trunc('week', $7::date) + interval '6 days')
         RETURNING id, status, delivery_date`,
        [client_id, courier_id, amount, service_value, total_to_collect,
         payment_method, delivery_date, notes, userId]
      );

      const delivery = result.rows[0];
      return {
        success: true,
        message: `${is_pickup ? 'Pickup' : 'Delivery'} created successfully`,
        id: delivery.id,
        status: delivery.status,
        date: delivery.delivery_date,
      };
    }

    case 'assign_base_money': {
      const { courier_id, amount, date = today, notes = null } = input;

      const result = await pool.query(
        `INSERT INTO daily_base_money (courier_id, assigned_by, amount, date, notes)
         VALUES ($1,$2,$3,$4,$5)
         RETURNING id, amount, date`,
        [courier_id, userId, amount, date, notes]
      );

      return {
        success: true,
        message: `Base money of $${amount.toLocaleString()} assigned`,
        id: result.rows[0].id,
        amount: result.rows[0].amount,
        date: result.rows[0].date,
      };
    }

    case 'register_operational_charge': {
      const { description, amount, date = today } = input;

      const result = await pool.query(
        `INSERT INTO operational_charges (created_by, description, amount, date)
         VALUES ($1,$2,$3,$4)
         RETURNING id, amount`,
        [userId, description, amount, date]
      );

      return {
        success: true,
        message: `Operational charge of $${amount.toLocaleString()} registered`,
        id: result.rows[0].id,
      };
    }

    case 'register_company_movement': {
      const { type, account, amount, description, date = today } = input;

      const result = await pool.query(
        `INSERT INTO company_money_movements (created_by, type, account, amount, description, date)
         VALUES ($1,$2,$3,$4,$5,$6)
         RETURNING id, type, account, amount`,
        [userId, type, account, amount, description, date]
      );

      const row = result.rows[0];
      return {
        success: true,
        message: `${type === 'income' ? 'Income' : 'Expense'} of $${amount.toLocaleString()} registered in ${account}`,
        id: row.id,
      };
    }

    case 'create_client': {
      const { name, phone = null, address = null, email = null, company = null, identification_number = null, notes = null } = input;

      const result = await pool.query(
        `INSERT INTO clients (name, phone, address, email, company, identification_number, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         RETURNING id, name`,
        [name, phone, address, email, company, identification_number, notes]
      );

      return {
        success: true,
        message: `Client "${result.rows[0].name}" created`,
        id: result.rows[0].id,
      };
    }

    case 'create_salary_advance': {
      const { courier_id, amount, reason = null, week_start = null, week_end = null } = input;

      const ws = week_start || today;
      const we = week_end || today;

      const result = await pool.query(
        `INSERT INTO salary_advances (courier_id, created_by, amount, reason, week_start, week_end)
         VALUES ($1,$2,$3,$4,$5,$6)
         RETURNING id, amount`,
        [courier_id, userId, amount, reason, ws, we]
      );

      return {
        success: true,
        message: `Salary advance of $${amount.toLocaleString()} registered`,
        id: result.rows[0].id,
      };
    }

    case 'get_clients': {
      const { search = '' } = input;
      const result = await pool.query(
        `SELECT id, name, phone, company, balance
         FROM clients
         WHERE name ILIKE $1 OR phone ILIKE $1 OR company ILIKE $1
         ORDER BY name
         LIMIT 20`,
        [`%${search}%`]
      );
      return { clients: result.rows };
    }

    case 'get_couriers': {
      const { search = '' } = input;
      const result = await pool.query(
        `SELECT p.user_id as id, p.full_name as name, p.phone
         FROM profiles p
         JOIN user_roles ur ON ur.user_id = p.user_id
         WHERE ur.role = 'courier'
           AND (p.full_name ILIKE $1 OR p.phone ILIKE $1)
         ORDER BY p.full_name
         LIMIT 20`,
        [`%${search}%`]
      );
      return { couriers: result.rows };
    }

    case 'get_deliveries': {
      const { courier_id, client_id, status, date, limit = 10 } = input;
      let query = `
        SELECT d.id, d.status, d.amount, d.total_to_collect, d.delivery_date,
               c.name as client_name, p.full_name as courier_name
        FROM deliveries d
        LEFT JOIN clients c ON d.client_id = c.id
        LEFT JOIN profiles p ON d.courier_id = p.user_id
        WHERE 1=1
      `;
      const params = [];
      let i = 1;
      if (courier_id) { query += ` AND d.courier_id = $${i++}`; params.push(courier_id); }
      if (client_id)  { query += ` AND d.client_id = $${i++}`;  params.push(client_id); }
      if (status)     { query += ` AND d.status = $${i++}`;     params.push(status); }
      if (date)       { query += ` AND d.delivery_date = $${i++}`; params.push(date); }
      query += ` ORDER BY d.created_at DESC LIMIT $${i}`;
      params.push(limit);

      const result = await pool.query(query, params);
      return { deliveries: result.rows, count: result.rows.length };
    }

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

module.exports = { executeTool }