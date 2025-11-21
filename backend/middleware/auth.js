// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.SECRET_KEY || 'fortnite_secret_key_2024';

const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Exportar la función como default
module.exports = authMiddleware;
// Exportar SECRET_KEY aparte
module.exports.SECRET_KEY = SECRET_KEY;