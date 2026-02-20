const cors = require('cors');

const origins = (process.env.CORS_ORIGINS || 'http://localhost:8080')
  .split(',')
  .map(o => o.trim());

const corsOptions = {
  origin: origins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

module.exports = cors(corsOptions);
