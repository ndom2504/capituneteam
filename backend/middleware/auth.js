import { auth } from '../config/firebase.js';
import { query } from '../config/db.js';

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = await auth.verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireRole = (roles) => async (req, res, next) => {
  try {
    const result = await query('SELECT role FROM users WHERE firebase_uid = $1', [req.user.uid]);
    if (!result.rows.length || !roles.includes(result.rows[0].role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    req.user.role = result.rows[0].role;
    next();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const loadUser = async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM users WHERE firebase_uid = $1', [req.user.uid]);
    if (result.rows.length) {
      req.user.dbUser = result.rows[0];
      req.user.role = result.rows[0].role;
    }
    next();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
