import { Router } from 'express';
import { query } from '../config/db.js';
import { verifyToken, requireRole, loadUser } from '../middleware/auth.js';

const router = Router();

router.get('/', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const result = await query('SELECT id, email, display_name, role, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/conseillers', verifyToken, loadUser, async (req, res) => {
  try {
    const result = await query('SELECT id, email, display_name FROM users WHERE role = $1', ['conseiller']);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/role', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { role } = req.body;
    const result = await query('UPDATE users SET role = $1 WHERE id = $2 RETURNING *', [role, req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
