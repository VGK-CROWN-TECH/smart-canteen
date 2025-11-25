const express = require('express');
const {
  getSales,
  getSale,
  createSale,
  updateSale,
  getSalesStats
} = require('../controllers/saleController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/stats/summary', getSalesStats);

router.route('/')
  .get(getSales)
  .post(createSale);

router.route('/:id')
  .get(getSale)
  .put(updateSale);

module.exports = router;
