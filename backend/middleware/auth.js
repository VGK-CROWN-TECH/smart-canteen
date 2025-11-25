const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { responseHandlers } = require('../utils/responses');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return responseHandlers.sendError(res, 401, 'Not authorized to access this route');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return responseHandlers.sendError(res, 401, 'User not found');
    }

    next();
  } catch (error) {
    return responseHandlers.sendError(res, 401, 'Not authorized to access this route');
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return responseHandlers.sendError(res, 403, `User role ${req.user.role} is not authorized to access this route`);
    }
    next();
  };
};

module.exports = {
  protect,
  authorize
};
