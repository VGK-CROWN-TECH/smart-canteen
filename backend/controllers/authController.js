const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { responseHandlers } = require('../utils/responses');
const validation = require('../utils/validation');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

const register = async (req, res) => {
  try {
    const requiredFields = validation.isEmpty(req.body, ['username', 'email', 'password']);
    if (requiredFields.length > 0) {
      return responseHandlers.sendMissingParam(res, requiredFields);
    }

    const { username, email, password, role } = req.body;
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return responseHandlers.sendError(res, 400, 'User already exists');
    }

    const user = await User.create({ username, email, password, role });

    const token = generateToken(user._id);

    const result = {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    };

    return responseHandlers.sendCreated(res, 'User registered successfully', result);
  } catch (error) {
    return responseHandlers.sendError(res, 500, error.message);
  }
};

const login = async (req, res) => {
  try {
    const requiredFields = validation.isEmpty(req.body, ['email', 'password']);
    if (requiredFields.length > 0) {
      return responseHandlers.sendMissingParam(res, requiredFields);
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return responseHandlers.sendError(res, 401, 'Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return responseHandlers.sendError(res, 401, 'Invalid credentials');
    }

    const token = generateToken(user._id);

    const result = {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    };

    return responseHandlers.sendSuccess(res, 'Login successful', result);
  } catch (error) {
    return responseHandlers.sendError(res, 500, error.message);
  }
};

const getMe = async (req, res) => {
  const result = {
    user: req.user
  };
  return responseHandlers.sendSuccess(res, 'User retrieved successfully', result);
};

module.exports = {
  register,
  login,
  getMe
};
