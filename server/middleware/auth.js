const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
      }
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }

    const result = await query(
      'SELECT id, name, email, account_status FROM users WHERE id=$1',
      [decoded.userId]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    const user = result.rows[0];
    if (user.account_status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Account suspended.' });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated.' });
  }
  if (req.user.email !== 'admin@gmail.com') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
  }
  next();
};

module.exports = { protect, adminOnly };
