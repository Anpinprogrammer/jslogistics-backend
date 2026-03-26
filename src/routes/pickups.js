const express = require('express');
const router = express.router();
const { authenticate, requireAdmin } = require('../middleware/auth');


router.use(authenticate);