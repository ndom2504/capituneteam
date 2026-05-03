import { Router } from 'express';
import { query } from '../config/db.js';
import { verifyToken, requireRole, loadUser } from '../middleware/auth.js';

const router = Router();

router.get('/', verifyToken, loadUser, async (req, res) => {
  try {
    let sql = 'SELECT t.*, d.data, d.programme FROM tickets t JOIN dossiers d ON t.dossier_id = d.id';
    let params = [];
    if (req.user.role === 'client') {
      sql += ' WHERE d.client_id = $1';
      params = [req.user.dbUser.id];
    } else if (req.user.role === 'conseiller') {
      sql += ' WHERE t.conseiller_id = $1';
      params = [req.user.dbUser.id];
    }
    sql += ' ORDER BY t.created_at DESC';
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', verifyToken, loadUser, async (req, res) => {
  try {
    const result = await query(
      'SELECT t.*, d.client_id, d.conseiller_id FROM tickets t JOIN dossiers d ON t.dossier_id = d.id WHERE t.id = $1',
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Ticket not found' });
    const ticket = result.rows[0];
    if (req.user.role === 'client' && ticket.client_id !== req.user.dbUser.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', verifyToken, requireRole(['conseiller', 'admin']), loadUser, async (req, res) => {
  try {
    if (!req.user.dbUser) {
      return res.status(404).json({ error: 'User not found in database' });
    }
    const { dossier_id, service_name, price, deadline } = req.body;
    const conseiller_id = req.user.dbUser.id;
    const result = await query(
      `INSERT INTO tickets (dossier_id, conseiller_id, service_name, price, status, deadline, created_at)
       VALUES ($1, $2, $3, $4, 'open', $5, NOW()) RETURNING *`,
      [dossier_id, conseiller_id, service_name, price, deadline]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/status', verifyToken, loadUser, async (req, res) => {
  try {
    const { status } = req.body;
    const result = await query('UPDATE tickets SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
