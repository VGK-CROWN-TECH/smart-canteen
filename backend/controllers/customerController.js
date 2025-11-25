const Customer = require('../models/Customer');
const { responseHandlers } = require('../utils/responses');
const validation = require('../utils/validation');

const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort('-createdAt');
    if (customers.length === 0) {
      return responseHandlers.sendNoRecord(res, 'No customers found');
    }
    return responseHandlers.sendSuccess(res, 'Customers retrieved successfully', { customers, count: customers.length });
  } catch (error) {
    return responseHandlers.sendError(res, 500, error.message);
  }
};

const getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return responseHandlers.sendNoRecord(res, 'Customer not found');
    }
    return responseHandlers.sendSuccess(res, 'Customer retrieved successfully', { customer });
  } catch (error) {
    return responseHandlers.sendError(res, 500, error.message);
  }
};

const createCustomer = async (req, res) => {
  try {
    const requiredFields = validation.isEmpty(req.body, ['companyName', 'contactPerson', 'email', 'phone']);
    if (requiredFields.length > 0) {
      return responseHandlers.sendMissingParam(res, requiredFields);
    }

    const customer = await Customer.create(req.body);
    return responseHandlers.sendCreated(res, 'Customer created successfully', { customer });
  } catch (error) {
    return responseHandlers.sendError(res, 400, error.message);
  }
};

const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!customer) {
      return responseHandlers.sendNoRecord(res, 'Customer not found');
    }
    return responseHandlers.sendSuccess(res, 'Customer updated successfully', { customer });
  } catch (error) {
    return responseHandlers.sendError(res, 400, error.message);
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return responseHandlers.sendNoRecord(res, 'Customer not found');
    }
    return responseHandlers.sendSuccess(res, 'Customer deleted successfully');
  } catch (error) {
    return responseHandlers.sendError(res, 500, error.message);
  }
};

module.exports = {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer
};
