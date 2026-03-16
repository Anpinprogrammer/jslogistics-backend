const express = require('express');
const router = express.Router();
//const { chat } = require('../controllers/agentController');
const { chat } = require('../controllers/aiController'); 
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate);
router.use(requireAdmin);

router.post('/chat', chat);

module.exports = router;
