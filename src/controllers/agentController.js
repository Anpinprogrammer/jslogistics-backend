const Anthropic = require('@anthropic-ai/sdk');
const { pool } = require('../config/database');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Tool definitions ─────────────────────────────────────────────────────────

const tools = [
  {
    name: 'create_delivery',
    description:
      `
        Create a new delivery or pickup in the logistics system.

        Use when the user wants to:
        - create a delivery
        - schedule a pickup
        - assign a delivery to a courier
        - register a new shipment

        Examples:
        - "create a delivery for client Maria with courier Carlos for 50,000"
        - "schedule a pickup for client Juan tomorrow"
        - "send a package with courier Pedro, value 120000"
        - "create delivery client ACME courier Luis collect 80k"

        If the user mentions pickup instead of delivery set is_pickup=true.
      `,
    input_schema: {
      type: 'object',
      properties: {
        client_id: { type: 'string', description: 'UUID of the client' },
        courier_id: { type: 'string', description: 'UUID of the courier (messenger)' },
        amount: {
          type: 'number',
          description: 'Declared value of the goods being delivered'
        },
        service_value: {
          type: 'number',
          description: 'Delivery service fee charged by the company'
        },
        total_to_collect: {
          type: 'number',
          description: 'Total money the courier must collect from the recipient (goods + service)'
        },
        payment_method: {
          type: 'string',
          enum: ['cash', 'transfer_to_courier', 'transfer_to_client'],
          description: 'How payment is collected',
        },
        delivery_date: { type: 'string', description: 'Delivery date YYYY-MM-DD. If not provided assume today.' },
        notes: { type: 'string', description: 'Optional notes' },
        is_pickup: { type: 'boolean', description: 'True if this is a pickup, false for delivery' },
      },
      required: ['client_id', 'courier_id'],
    },
  },
  {
    name: 'assign_base_money',
    description:
      'Assign daily base money (cash) to a courier at the start of the day. Use for messages like "give Carlos 50,000 base money".',
    input_schema: {
      type: 'object',
      properties: {
        courier_id: { type: 'string', description: 'UUID of the courier' },
        amount: { type: 'number', description: 'Amount of base money to assign' },
        date: { type: 'string', description: 'Date YYYY-MM-DD (default today)' },
        notes: { type: 'string', description: 'Optional notes' },
      },
      required: ['courier_id', 'amount'],
    },
  },
  {
    name: 'register_operational_charge',
    description:
      'Register an operational expense/charge for the company. Use for messages like "register expense $20,000 for gasoline".',
    input_schema: {
      type: 'object',
      properties: {
        description: { type: 'string', description: 'Description of the expense' },
        amount: { type: 'number', description: 'Amount of the expense' },
        date: { type: 'string', description: 'Date YYYY-MM-DD (default today)' },
      },
      required: ['description', 'amount'],
    },
  },
  {
    name: 'register_company_movement',
    description:
      'Register an income or expense in the company accounts (cash, Bancolombia, Nequi). Use for messages like "add income $200,000 to Nequi account".',
    input_schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['income', 'expense'],
          description: 'Whether this is an income or expense',
        },
        account: {
          type: 'string',
          enum: ['cash', 'bancolombia', 'nequi'],
          description: 'Which company account',
        },
        amount: { type: 'number', description: 'Amount of the movement' },
        description: { type: 'string', description: 'Description of the movement' },
        date: { type: 'string', description: 'Date YYYY-MM-DD (default today)' },
      },
      required: ['type', 'account', 'amount', 'description'],
    },
  },
  {
    name: 'create_client',
    description:
      'Create a new client in the system. Use for messages like "create client John Doe, phone 3001234567".',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Full name of the client' },
        phone: { type: 'string', description: 'Phone number' },
        address: { type: 'string', description: 'Address' },
        email: { type: 'string', description: 'Email address' },
        company: { type: 'string', description: 'Company name if applicable' },
        identification_number: { type: 'string', description: 'National ID or company ID' },
        notes: { type: 'string', description: 'Additional notes' },
      },
      required: ['name'],
    },
  },
  {
    name: 'create_salary_advance',
    description:
      'Register a salary advance for a courier. Use for messages like "give Carlos an advance of $80,000".',
    input_schema: {
      type: 'object',
      properties: {
        courier_id: { type: 'string', description: 'UUID of the courier' },
        amount: { type: 'number', description: 'Amount of the advance' },
        reason: { type: 'string', description: 'Reason for the advance' },
        week_start: { type: 'string', description: 'Week start date YYYY-MM-DD' },
        week_end: { type: 'string', description: 'Week end date YYYY-MM-DD' },
      },
      required: ['courier_id', 'amount'],
    },
  },
  {
    name: 'get_clients',
    description: 'Search and list clients. Use when you need to find a client ID by name.',
    input_schema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Search term (name, phone, company)' },
      },
    },
  },
  {
    name: 'get_couriers',
    description: 'List all couriers. Use when you need to find a courier ID by name.',
    input_schema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Optional search term' },
      },
    },
  },
  {
    name: 'get_deliveries',
    description: 'Query deliveries with optional filters.',
    input_schema: {
      type: 'object',
      properties: {
        courier_id: { type: 'string', description: 'Filter by courier UUID' },
        client_id: { type: 'string', description: 'Filter by client UUID' },
        status: {
          type: 'string',
          enum: ['pending', 'completed', 'cancelled', 'not_delivered_collected', 'not_delivered_no_collection'],
        },
        date: { type: 'string', description: 'Filter by date YYYY-MM-DD' },
        limit: { type: 'number', description: 'Max results to return (default 10)' },
      },
    },
  },
];

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

// ─── Main handler ──────────────────────────────────────────────────────────────

const chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    const userId = req.user.id;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message is required' });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
    }

    // Build messages array from history + new user message
    const messages = [
      ...history,
      { role: 'user', content: message },
    ];

    const systemPrompt = `You are an AI assistant for "Cargo Guardian", a logistics and delivery management system.
You help the administrator register information quickly through natural language.

Today's date is: ${new Date().toISOString().split('T')[0]}

Your capabilities:
- Create deliveries and pickups
- Assign base money to couriers
- Register operational expenses/charges
- Register company income and expenses (accounts: cash, bancolombia, nequi)
- Create new clients
- Register salary advances for couriers
- Query deliveries and client information

Important rules:
- Always respond in the same language the user writes in (Spanish or English)
- When you need a client or courier ID and only have a name, use get_clients or get_couriers first
- Confirm what you registered with specific details (amounts, names, dates)
- If something is ambiguous, ask for clarification before creating records
- Format currency amounts with thousands separators for readability
- Be concise and helpful`;

    let response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      tools,
      messages,
    });

    // Agentic loop: process tool calls until Claude returns end_turn
    while (response.stop_reason === 'tool_use') {
      const assistantMessage = { role: 'assistant', content: response.content };
      messages.push(assistantMessage);

      const toolResults = [];
      for (const block of response.content) {
        if (block.type !== 'tool_use') continue;

        let toolResult;
        try {
          toolResult = await executeTool(block.name, block.input, userId);
        } catch (err) {
          console.error(`Tool ${block.name} error:`, err.message);
          toolResult = { success: false, error: err.message };
        }

        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: JSON.stringify(toolResult),
        });
      }

      messages.push({ role: 'user', content: toolResults });

      response = await client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 1024,
        system: systemPrompt,
        tools,
        messages,
      });
    }

    // Extract final text response
    const textBlock = response.content.find((b) => b.type === 'text');
    const reply = textBlock ? textBlock.text : 'Done.';

    // Return the reply + updated history for the frontend to maintain
    const updatedHistory = messages.slice(history.length); // only new turns
    res.json({ reply, newTurns: updatedHistory });
  } catch (err) {
    console.error('Agent error:', err);
    res.status(500).json({ error: err.message || 'Agent error' });
  }
};

module.exports = { chat };
