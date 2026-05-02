import { Router } from 'express';
import { query } from '../config/db.js';
import { verifyToken, requireRole, loadUser } from '../middleware/auth.js';

const router = Router();

router.get('/', verifyToken, loadUser, async (req, res) => {
  try {
    let sql = 'SELECT * FROM dossiers';
    let params = [];
    if (req.user.role === 'client') {
      sql += ' WHERE client_id = $1';
      params = [req.user.dbUser.id];
    } else if (req.user.role === 'conseiller') {
      sql += ' WHERE conseiller_id = $1 OR conseiller_id IS NULL';
      params = [req.user.dbUser.id];
    }
    sql += ' ORDER BY created_at DESC';
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', verifyToken, loadUser, async (req, res) => {
  try {
    const result = await query('SELECT * FROM dossiers WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Dossier not found' });
    const dossier = result.rows[0];
    if (req.user.role === 'client' && dossier.client_id !== req.user.dbUser.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(dossier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', verifyToken, requireRole(['client']), async (req, res) => {
  try {
    const { type, title, description } = req.body;
    const client_id = req.user.dbUser.id;
    const result = await query(
      `INSERT INTO dossiers (client_id, type, title, description, status, created_at)
       VALUES ($1, $2, $3, $4, 'pending', NOW()) RETURNING *`,
      [client_id, type, title, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/assign', verifyToken, requireRole(['conseiller', 'admin']), async (req, res) => {
  try {
    const { status, conseiller_id } = req.body;
    const result = await query(
      'UPDATE dossiers SET status = $1, conseiller_id = $2 WHERE id = $3 RETURNING *',
      [status, conseiller_id || req.user.dbUser.id, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
