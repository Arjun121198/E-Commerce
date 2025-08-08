const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { successResponse, errorResponse } = require('../utils/responseHelper');
require('dotenv').config();

class AuthController {
  login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return errorResponse(res, 401, 'Invalid credentials');
      }
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return errorResponse(res, 401, 'Invalid credentials');
      }
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return successResponse(res, 200, 'Login successful', { token });
    } catch (err) {
      return errorResponse(res, 500, 'Login failed', err.message);
    }
  };
}

module.exports = new AuthController();