const { verifyAccessToken } = require('../services/jwt');

function verifyJWT(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: Missing Bearer token.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token);
    
    req.user = {
      id: decoded.userId,
      username: decoded.username,
    };
    next();
  } catch (err) {
    console.error('verifyJWT error:', err);
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
}

module.exports = verifyJWT;