const express = require('express');
const router = express.Router();
const { getAll, getById, getWithDebt, create, update, updateAll, remove, getStatement } = require('../controllers/clientsController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const paginate = require('../middleware/paginate');
router.use(authenticate);

router.get('/with-debt', requireAdmin, getWithDebt);
router.get('/:id/statement', getStatement);
router.get('/', paginate, getAll);
router.get('/:id', getById);
router.post('/', create);
router.put('/', requireAdmin, updateAll)
router.put('/:id', update);
router.delete('/:id', requireAdmin, remove);

module.exports = router;
