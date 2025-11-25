const Sale = require('../models/Sale');
const Item = require('../models/Item');
const Customer = require('../models/Customer');
const { responseHandlers } = require('../utils/responses');
const validation = require('../utils/validation');

const generateInvoiceNumber = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const count = await Sale.countDocuments() + 1;
  return `INV-${year}${month}-${String(count).padStart(4, '0')}`;
};

const getSales = async (req, res) => {
  try {
    const { startDate, endDate, customer, paymentStatus } = req.query;
    let query = {};

    if (startDate || endDate) {
      query.saleDate = {};
      if (startDate) query.saleDate.$gte = new Date(startDate);
      if (endDate) query.saleDate.$lte = new Date(endDate);
    }
    if (customer) query.customer = customer;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const sales = await Sale.find(query)
      .populate('customer', 'companyName contactPerson')
      .populate('items.item', 'name')
      .populate('createdBy', 'username')
      .sort('-saleDate');

    if (sales.length === 0) {
      return responseHandlers.sendNoRecord(res, 'No sales found');
    }

    return responseHandlers.sendSuccess(res, 'Sales retrieved successfully', { sales, count: sales.length });
  } catch (error) {
    return responseHandlers.sendError(res, 500, error.message);
  }
};

const getSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('customer')
      .populate('items.item')
      .populate('createdBy', 'username');

    if (!sale) {
      return responseHandlers.sendNoRecord(res, 'Sale not found');
    }
    return responseHandlers.sendSuccess(res, 'Sale retrieved successfully', { sale });
  } catch (error) {
    return responseHandlers.sendError(res, 500, error.message);
  }
};

const createSale = async (req, res) => {
  try {
    const requiredFields = validation.isEmpty(req.body, ['customer', 'items']);
    if (requiredFields.length > 0) {
      return responseHandlers.sendMissingParam(res, requiredFields);
    }

    const { customer, items } = req.body;

    if (!items || items.length === 0) {
      return responseHandlers.sendError(res, 400, 'At least one item is required');
    }

    const customerExists = await Customer.findById(customer);
    if (!customerExists) {
      return responseHandlers.sendNoRecord(res, 'Customer not found');
    }

    let totalAmount = 0;
    const saleItems = [];

    for (const saleItem of items) {
      const item = await Item.findById(saleItem.item);
      if (!item) {
        return responseHandlers.sendNoRecord(res, `Item ${saleItem.item} not found`);
      }

      if (item.stock < saleItem.quantity) {
        return responseHandlers.sendError(res, 400, `Insufficient stock for ${item.name}. Available: ${item.stock}`);
      }

      const subtotal = item.price * saleItem.quantity;
      totalAmount += subtotal;

      saleItems.push({
        item: item._id,
        itemName: item.name,
        quantity: saleItem.quantity,
        price: item.price,
        subtotal
      });

      item.stock -= saleItem.quantity;
      await item.save();
    }

    const invoiceNumber = await generateInvoiceNumber();

    const sale = await Sale.create({
      invoiceNumber,
      customer,
      items: saleItems,
      totalAmount,
      paymentStatus: req.body.paymentStatus || 'pending',
      createdBy: req.user._id
    });

    const populatedSale = await Sale.findById(sale._id)
      .populate('customer')
      .populate('items.item')
      .populate('createdBy', 'username');

    return responseHandlers.sendCreated(res, 'Sale created successfully', { sale: populatedSale });
  } catch (error) {
    return responseHandlers.sendError(res, 400, error.message);
  }
};

const updateSale = async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    const sale = await Sale.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true, runValidators: true }
    ).populate('customer').populate('items.item');

    if (!sale) {
      return responseHandlers.sendNoRecord(res, 'Sale not found');
    }

    return responseHandlers.sendSuccess(res, 'Sale updated successfully', { sale });
  } catch (error) {
    return responseHandlers.sendError(res, 400, error.message);
  }
};

const getSalesStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let matchStage = {};

    if (startDate || endDate) {
      matchStage.saleDate = {};
      if (startDate) matchStage.saleDate.$gte = new Date(startDate);
      if (endDate) matchStage.saleDate.$lte = new Date(endDate);
    }

    const stats = await Sale.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          avgSaleAmount: { $avg: '$totalAmount' }
        }
      }
    ]);

    const topItems = await Sale.aggregate([
      { $match: matchStage },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.itemName',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 }
    ]);

    const topCustomers = await Sale.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$customer',
          totalPurchases: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customerInfo'
        }
      },
      { $unwind: '$customerInfo' }
    ]);

    const result = {
      summary: stats[0] || { totalSales: 0, totalRevenue: 0, avgSaleAmount: 0 },
      topItems,
      topCustomers
    };

    return responseHandlers.sendSuccess(res, 'Sales statistics retrieved successfully', result);
  } catch (error) {
    return responseHandlers.sendError(res, 500, error.message);
  }
};

module.exports = {
  getSales,
  getSale,
  createSale,
  updateSale,
  getSalesStats
};
