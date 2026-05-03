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

router.put('/profile', verifyToken, loadUser, async (req, res) => {
  try {
    const { first_name, last_name, profile_photo_url } = req.body;
    const userId = req.user.dbUser.id;
    const result = await query(
      `UPDATE users 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           profile_photo_url = COALESCE($3, profile_photo_url)
       WHERE id = $4 RETURNING *`,
      [first_name, last_name, profile_photo_url, userId]
    );
    res.json(result.rows[0]);
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
