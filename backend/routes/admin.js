import { Router } from 'express';
import { query } from '../config/db.js';
import { verifyToken, requireRole, loadUser } from '../middleware/auth.js';

const router = Router();

router.post('/migrate', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    await query("ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'active'");
    await query("UPDATE users SET account_status = 'active' WHERE account_status IS NULL");
    res.json({ ok: true, message: 'Migration admin terminée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/overview', verifyToken, requireRole(['admin']), loadUser, async (req, res) => {
  try {
    const [users, dossiers, payments, tickets] = await Promise.all([
      query('SELECT COUNT(*)::int as total FROM users'),
      query('SELECT COUNT(*)::int as total FROM dossiers'),
      query('SELECT COALESCE(SUM(amount), 0)::numeric as total, COUNT(*)::int as count FROM payments WHERE status = $1', ['reussi']),
      query('SELECT COUNT(*)::int as total FROM tickets'),
    ]);
    res.json({
      users: users.rows[0].total,
      dossiers: dossiers.rows[0].total,
      paidAmount: payments.rows[0].total,
      successfulPayments: payments.rows[0].count,
      tickets: tickets.rows[0].total,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/users', verifyToken, requireRole(['admin']), loadUser, async (req, res) => {
  try {
    await query("ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'active'");
    const result = await query(
      `SELECT id, email, display_name, first_name, last_name, role, account_status, created_at
       FROM users
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/users/:id', verifyToken, requireRole(['admin']), loadUser, async (req, res) => {
  try {
    await query("ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'active'");
    const { role, account_status } = req.body;
    const allowedRoles = ['client', 'conseiller', 'admin'];
    const allowedStatuses = ['active', 'pending', 'suspended', 'disabled'];
    if (role && !allowedRoles.includes(role)) return res.status(400).json({ error: 'Role invalide' });
    if (account_status && !allowedStatuses.includes(account_status)) return res.status(400).json({ error: 'Statut invalide' });
    const result = await query(
      `UPDATE users
       SET role = COALESCE($1, role), account_status = COALESCE($2, account_status)
       WHERE id = $3 RETURNING id, email, display_name, first_name, last_name, role, account_status, created_at`,
      [role || null, account_status || null, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/dossiers', verifyToken, requireRole(['admin']), loadUser, async (req, res) => {
  try {
    const result = await query(
      `SELECT d.*, 
              c.email as client_email, c.first_name as client_first_name, c.last_name as client_last_name,
              co.email as conseiller_email, co.first_name as conseiller_first_name, co.last_name as conseiller_last_name
       FROM dossiers d
       JOIN users c ON d.client_id = c.id
       LEFT JOIN users co ON d.conseiller_id = co.id
       ORDER BY d.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/dossiers/:id', verifyToken, requireRole(['admin']), loadUser, async (req, res) => {
  try {
    const { statut, conseiller_id } = req.body;
    const allowedStatuses = ['brouillon', 'envoye', 'accepte', 'refuse'];
    if (statut && !allowedStatuses.includes(statut)) return res.status(400).json({ error: 'Statut invalide' });
    const result = await query(
      `UPDATE dossiers
       SET statut = COALESCE($1, statut), conseiller_id = COALESCE($2, conseiller_id)
       WHERE id = $3 RETURNING *`,
      [statut || null, conseiller_id || null, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Dossier introuvable' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/payments', verifyToken, requireRole(['admin']), loadUser, async (req, res) => {
  try {
    const result = await query(
      `SELECT p.*, t.service_name, t.status as ticket_status, t.dossier_id,
              c.email as client_email, c.first_name as client_first_name, c.last_name as client_last_name,
              co.email as conseiller_email, co.first_name as conseiller_first_name, co.last_name as conseiller_last_name
       FROM payments p
       JOIN tickets t ON p.ticket_id = t.id
       JOIN dossiers d ON t.dossier_id = d.id
       JOIN users c ON d.client_id = c.id
       LEFT JOIN users co ON t.conseiller_id = co.id
       ORDER BY p.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/payments/:id', verifyToken, requireRole(['admin']), loadUser, async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['initie', 'reussi', 'echec', 'rembourse'];
    if (!allowedStatuses.includes(status)) return res.status(400).json({ error: 'Statut invalide' });
    const result = await query('UPDATE payments SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Paiement introuvable' });
    if (status === 'reussi') await query('UPDATE tickets SET status = $1 WHERE id = $2', ['payee', result.rows[0].ticket_id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
