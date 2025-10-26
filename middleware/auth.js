const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';
const { db } = require('../db');

function requireSession(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.status(401).json({ error: 'Session required' });
}

function requireJwt(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Authorization header missing' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, SECRET);
    req.jwtUser = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Combined guard: allow either session or valid JWT
function requireUser(req, res, next) {
  if (req.session && req.session.user) {
    req.user = req.session.user;
    return next();
  }
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Not authenticated' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { requireSession, requireJwt, requireUser, SECRET };
