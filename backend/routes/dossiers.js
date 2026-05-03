import { Router } from 'express';
import { query } from '../config/db.js';
import { verifyToken, requireRole, loadUser } from '../middleware/auth.js';

const router = Router();

// POST /api/dossiers - Create dossier by client
router.post('/', verifyToken, requireRole(['client']), loadUser, async (req, res) => {
  try {
    const { programme, data } = req.body;
    const client_id = req.user.dbUser.id;
    const result = await query(
      `INSERT INTO dossiers (client_id, programme, statut, data, created_at)
       VALUES ($1, $2, 'brouillon', $3, NOW()) RETURNING *`,
      [client_id, programme, data]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dossiers - List dossiers for client
router.get('/', verifyToken, loadUser, async (req, res) => {
  try {
    if (req.user.role === 'client') {
      const result = await query(
        'SELECT * FROM dossiers WHERE client_id = $1 ORDER BY created_at DESC',
        [req.user.dbUser.id]
      );
      res.json(result.rows);
    } else {
      res.status(403).json({ error: 'Forbidden' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dossiers/:id - Get specific dossier
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

// POST /api/dossiers/:id/envoyer - Send dossier to conseiller
router.post('/:id/envoyer', verifyToken, requireRole(['client']), async (req, res) => {
  try {
    const { conseiller_id } = req.body;
    const result = await query(
      `UPDATE dossiers SET statut = 'envoye', conseiller_id = $1 WHERE id = $2 AND client_id = $3 RETURNING *`,
      [conseiller_id, req.params.id, req.user.dbUser.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Dossier not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/conseiller/dossiers - List dossiers for conseiller
router.get('/conseiller/dossiers', verifyToken, requireRole(['conseiller']), async (req, res) => {
  try {
    const result = await query(
      `SELECT d.*, u.first_name, u.last_name, u.email
       FROM dossiers d
       JOIN users u ON d.client_id = u.id
       WHERE d.conseiller_id = $1 AND d.statut = 'envoye'
       ORDER BY d.created_at DESC`,
      [req.user.dbUser.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/dossiers/:id/accepter - Accept dossier by conseiller
router.post('/:id/accepter', verifyToken, requireRole(['conseiller']), async (req, res) => {
  try {
    const result = await query(
      `UPDATE dossiers SET statut = 'accepte' WHERE id = $1 AND conseiller_id = $2 RETURNING *`,
      [req.params.id, req.user.dbUser.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Dossier not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/dossiers/:id/refuser - Refuse dossier with reason
router.post('/:id/refuser', verifyToken, requireRole(['conseiller']), async (req, res) => {
  try {
    const { refusal_reason } = req.body;
    const result = await query(
      `UPDATE dossiers SET statut = 'refuse', refusal_reason = $1 WHERE id = $2 AND conseiller_id = $3 RETURNING *`,
      [refusal_reason, req.params.id, req.user.dbUser.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Dossier not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
