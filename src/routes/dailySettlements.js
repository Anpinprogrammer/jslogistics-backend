const express = require('express');
const router = express.Router();
const { getAll, create, settle, reopen, getBaseMoney, assignBaseMoney, createPartialDelivery, settleDailySettlement, getPartialDeliveries, deleteDaily } = require('../controllers/dailySettlementsController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getAll);
router.post('/', requireAdmin, create);
router.patch('/:id/settle', requireAdmin, settleDailySettlement);
router.patch('/reopen', requireAdmin, reopen);
router.post('/base-money', requireAdmin, assignBaseMoney);
router.get('/get-base-money', requireAdmin, getBaseMoney)
router.post('/partial-delivery', requireAdmin, createPartialDelivery);
router.get('/get-partial-deliveries', requireAdmin, getPartialDeliveries)
router.delete('/', requireAdmin, deleteDaily)

module.exports = router;
