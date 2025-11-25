const express = require('express');
const {
  getItems,
  getLowStockItems,
  getItem,
  createItem,
  updateItem,
  deleteItem
} = require('../controllers/itemController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/low-stock', getLowStockItems);

router.route('/')
  .get(getItems)
  .post(authorize('admin'), createItem);

router.route('/:id')
  .get(getItem)
  .put(authorize('admin'), updateItem)
  .delete(authorize('admin'), deleteItem);

module.exports = router;
