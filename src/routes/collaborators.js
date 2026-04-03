const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { create } = require('../controllers/collaboratorsController');

router.use(authenticate);
router.use(requireAdmin);

router.post('/', create);

module.exports = router;