import { Router } from 'express';
import { query } from '../config/db.js';
import { verifyToken, loadUser } from '../middleware/auth.js';

const router = Router();
const ADMIN_EMAILS = ['info@misterdil.ca'];

router.post('/register', verifyToken, async (req, res) => {
  try {
    const { displayName, role = 'client' } = req.body;
    const uid = req.user.uid;
    const email = req.user.email?.toLowerCase();
    const assignedRole = ADMIN_EMAILS.includes(email) ? 'admin' : role;

    // Upsert: return existing user if already registered
    const existing = await query('SELECT * FROM users WHERE firebase_uid = $1', [uid]);
    if (existing.rows.length) {
      if (ADMIN_EMAILS.includes(email) && existing.rows[0].role !== 'admin') {
        const updated = await query('UPDATE users SET role = $1 WHERE firebase_uid = $2 RETURNING *', ['admin', uid]);
        return res.json(updated.rows[0]);
      }
      return res.json(existing.rows[0]);
    }

    const result = await query(
      `INSERT INTO users (firebase_uid, email, display_name, role, created_at)
       VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
      [uid, email, displayName || email.split('@')[0], assignedRole]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', verifyToken, loadUser, async (req, res) => {
  try {
    if (req.user.dbUser) {
      const email = req.user.email?.toLowerCase();
      if (ADMIN_EMAILS.includes(email) && req.user.dbUser.role !== 'admin') {
        const updated = await query('UPDATE users SET role = $1 WHERE firebase_uid = $2 RETURNING *', ['admin', req.user.uid]);
        return res.json(updated.rows[0]);
      }
      return res.json(req.user.dbUser);
    }
    const result = await query('SELECT * FROM users WHERE firebase_uid = $1', [req.user.uid]);
    if (!result.rows.length) {
      const email = req.user.email?.toLowerCase();
      const assignedRole = ADMIN_EMAILS.includes(email) ? 'admin' : 'client';
      const created = await query(
        `INSERT INTO users (firebase_uid, email, display_name, role, created_at)
         VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
        [req.user.uid, email, req.user.name || email.split('@')[0], assignedRole]
      );
      return res.status(201).json(created.rows[0]);
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
