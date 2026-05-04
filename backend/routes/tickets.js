import { Router } from 'express';
import { query } from '../config/db.js';
import { verifyToken, requireRole, loadUser } from '../middleware/auth.js';

const router = Router();

router.get('/', verifyToken, loadUser, async (req, res) => {
  try {
    if (!req.user.dbUser) {
      return res.status(404).json({ error: 'User not found in database' });
    }
    let sql = `SELECT t.*, d.data, d.programme, d.statut as dossier_statut, d.client_id, d.conseiller_id as dossier_conseiller_id,
               u.display_name as client_name, p.status as payment_status
               FROM tickets t
               JOIN dossiers d ON t.dossier_id = d.id
               JOIN users u ON d.client_id = u.id
               LEFT JOIN payments p ON p.ticket_id = t.id`;
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
    if (!req.user.dbUser) {
      return res.status(404).json({ error: 'User not found in database' });
    }
    const result = await query(
      `SELECT t.*, d.client_id, d.conseiller_id, d.programme, d.statut as dossier_statut,
       u.display_name as client_name, p.status as payment_status
       FROM tickets t
       JOIN dossiers d ON t.dossier_id = d.id
       JOIN users u ON d.client_id = u.id
       LEFT JOIN payments p ON p.ticket_id = t.id
       WHERE t.id = $1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Ticket not found' });
    const ticket = result.rows[0];
    if (req.user.role === 'client' && ticket.client_id !== req.user.dbUser.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (req.user.role === 'conseiller' && ticket.conseiller_id !== req.user.dbUser.id) {
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
    const { dossier_id, service_name, description, scope, conditions, price, deadline } = req.body;
    const conseiller_id = req.user.dbUser.id;
    const dossierResult = await query(
      `SELECT id, conseiller_id, statut FROM dossiers WHERE id = $1`,
      [dossier_id]
    );
    if (!dossierResult.rows.length) return res.status(404).json({ error: 'Dossier not found' });
    const dossier = dossierResult.rows[0];
    if (dossier.conseiller_id !== conseiller_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (dossier.statut !== 'accepte') {
      return res.status(400).json({ error: 'Le dossier doit être accepté avant de créer une requête de service' });
    }
    if (!service_name || !price || Number(price) <= 0) {
      return res.status(400).json({ error: 'Service et prix requis' });
    }
    const result = await query(
      `INSERT INTO tickets (dossier_id, conseiller_id, service_name, description, scope, conditions, price, status, deadline, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'en_attente_paiement', $8, NOW()) RETURNING *`,
      [dossier_id, conseiller_id, service_name, description || '', scope || '', conditions || '', price, deadline || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/status', verifyToken, loadUser, async (req, res) => {
  try {
    if (!req.user.dbUser) {
      return res.status(404).json({ error: 'User not found in database' });
    }
    const { status } = req.body;
    const allowedStatuses = ['en_cours', 'termine'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const ticketResult = await query(
      `SELECT t.*, d.conseiller_id FROM tickets t JOIN dossiers d ON t.dossier_id = d.id WHERE t.id = $1`,
      [req.params.id]
    );
    if (!ticketResult.rows.length) return res.status(404).json({ error: 'Ticket not found' });
    const ticket = ticketResult.rows[0];
    if (req.user.role !== 'conseiller' || ticket.conseiller_id !== req.user.dbUser.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (status === 'en_cours' && ticket.status !== 'payee') {
      return res.status(400).json({ error: 'Le service doit être payé avant de démarrer' });
    }
    if (status === 'termine' && !['payee', 'en_cours'].includes(ticket.status)) {
      return res.status(400).json({ error: 'Le service doit être payé ou en cours avant clôture' });
    }
    const result = await query('UPDATE tickets SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
