const express = require('express');
const router = express.Router();
const { getAll, create, settle, reopen, getBaseMoney, assignBaseMoney, createPartialDelivery, settleDailySettlement, getPartialDeliveries, deleteDaily, getAllCompany, createCompanyAssignment, resetCompanyAccounts, getTransactions, editOpeningBalance } = require('../controllers/dailySettlementsController');
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
router.get('/company', requireAdmin, getAllCompany)
router.post('/company/money-assignment', requireAdmin, createCompanyAssignment)
router.post('/company/reset', requireAdmin, resetCompanyAccounts)
router.put('/company/movements/opening-balance', requireAdmin, editOpeningBalance)
router.get('/company/transactions/:account', requireAdmin, getTransactions)

module.exports = router;
