import { Router } from 'express';
import { query } from '../config/db.js';
import { verifyToken, loadUser } from '../middleware/auth.js';

const router = Router();

router.post('/register', verifyToken, async (req, res) => {
  try {
    const { displayName, role = 'client' } = req.body;
    const uid = req.user.uid;
    const email = req.user.email;

    // Upsert: return existing user if already registered
    const existing = await query('SELECT * FROM users WHERE firebase_uid = $1', [uid]);
    if (existing.rows.length) {
      return res.json(existing.rows[0]);
    }

    const result = await query(
      `INSERT INTO users (firebase_uid, email, display_name, role, created_at)
       VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
      [uid, email, displayName || email.split('@')[0], role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', verifyToken, loadUser, async (req, res) => {
  try {
    if (req.user.dbUser) {
      return res.json(req.user.dbUser);
    }
    const result = await query('SELECT * FROM users WHERE firebase_uid = $1', [req.user.uid]);
    if (!result.rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
