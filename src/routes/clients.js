const express = require('express');
const router = express.Router();
const { getAll, inFavor, withDebt, getById, getDailySummary, create, update, updateAll, remove, getStatement } = require('../controllers/clientsController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const paginate = require('../middleware/paginate');
router.use(authenticate);

router.get('/:id/statement', getStatement);
router.get('/', paginate, getAll);
router.get('/in-favor', paginate, inFavor);
router.get('/with-debt', requireAdmin, paginate, withDebt);
router.get('/summary/daily', paginate, getDailySummary)
router.get('/:id', getById);
router.post('/', create);
router.put('/', requireAdmin, updateAll)
router.put('/:id', update);
router.delete('/:id', requireAdmin, remove);

module.exports = router;
