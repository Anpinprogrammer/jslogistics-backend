// ─── Tool definitions ─────────────────────────────────────────────────────────

export const tools = [
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
