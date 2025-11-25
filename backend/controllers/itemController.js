const Item = require('../models/Item');
const { responseHandlers } = require('../utils/responses');
const validation = require('../utils/validation');

const getItems = async (req, res) => {
  try {
    const items = await Item.find().sort('-createdAt');
    if (items.length === 0) {
      return responseHandlers.sendNoRecord(res, 'No items found');
    }
    return responseHandlers.sendSuccess(res, 'Items retrieved successfully', { items, count: items.length });
  } catch (error) {
    return responseHandlers.sendError(res, 500, error.message);
  }
};

const getLowStockItems = async (req, res) => {
  try {
    const items = await Item.find({ $expr: { $lte: ['$stock', '$lowStockThreshold'] } });
    if (items.length === 0) {
      return responseHandlers.sendNoRecord(res, 'No low stock items');
    }
    return responseHandlers.sendSuccess(res, 'Low stock items retrieved successfully', { items, count: items.length });
  } catch (error) {
    return responseHandlers.sendError(res, 500, error.message);
  }
};

const getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return responseHandlers.sendNoRecord(res, 'Item not found');
    }
    return responseHandlers.sendSuccess(res, 'Item retrieved successfully', { item });
  } catch (error) {
    return responseHandlers.sendError(res, 500, error.message);
  }
};

const createItem = async (req, res) => {
  try {
    const requiredFields = validation.isEmpty(req.body, ['name', 'category', 'price']);
    if (requiredFields.length > 0) {
      return responseHandlers.sendMissingParam(res, requiredFields);
    }

    const item = await Item.create(req.body);
    return responseHandlers.sendCreated(res, 'Item created successfully', { item });
  } catch (error) {
    return responseHandlers.sendError(res, 400, error.message);
  }
};

const updateItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!item) {
      return responseHandlers.sendNoRecord(res, 'Item not found');
    }
    return responseHandlers.sendSuccess(res, 'Item updated successfully', { item });
  } catch (error) {
    return responseHandlers.sendError(res, 400, error.message);
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return responseHandlers.sendNoRecord(res, 'Item not found');
    }
    return responseHandlers.sendSuccess(res, 'Item deleted successfully');
  } catch (error) {
    return responseHandlers.sendError(res, 500, error.message);
  }
};

module.exports = {
  getItems,
  getLowStockItems,
  getItem,
  createItem,
  updateItem,
  deleteItem
};
