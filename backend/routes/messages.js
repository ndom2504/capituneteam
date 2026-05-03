import { Router } from 'express';
import { query } from '../config/db.js';
import { verifyToken, loadUser } from '../middleware/auth.js';
import multer from 'multer';

// Use memory storage for Vercel (read-only filesystem)
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

router.get('/', verifyToken, loadUser, async (req, res) => {
  try {
    const uid = req.user.dbUser.id;
    let result;
    if (req.user.role === 'conseiller') {
      // For conseillers, fetch messages from dossiers assigned to them
      result = await query(
        `SELECT m.*, u.display_name as sender_name, d.programme
         FROM messages m
         JOIN users u ON m.sender_id = u.id
         JOIN dossiers d ON m.dossier_id = d.id
         WHERE d.conseiller_id = $1
         ORDER BY m.created_at DESC`,
        [uid]
      );
    } else {
      // For clients, fetch messages from their dossiers
      result = await query(
        `SELECT m.*, u.display_name as sender_name, d.programme
         FROM messages m
         JOIN users u ON m.sender_id = u.id
         JOIN dossiers d ON m.dossier_id = d.id
         WHERE d.client_id = $1
         ORDER BY m.created_at DESC`,
        [uid]
      );
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:dossierId', verifyToken, loadUser, async (req, res) => {
  try {
    const dossierResult = await query('SELECT client_id, conseiller_id FROM dossiers WHERE id = $1', [req.params.dossierId]);
    if (!dossierResult.rows.length) return res.status(404).json({ error: 'Dossier not found' });
    const dossier = dossierResult.rows[0];
    const uid = req.user.dbUser.id;
    if (req.user.role === 'client' && dossier.client_id !== uid) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (req.user.role === 'conseiller' && dossier.conseiller_id !== uid && dossier.conseiller_id !== null) {
      // Allow if conseiller is not assigned yet and they want to view
    }
    const result = await query(
      'SELECT m.*, u.display_name as sender_name FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.dossier_id = $1 ORDER BY m.created_at ASC',
      [req.params.dossierId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:dossierId', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const { content } = req.body;
    const dossierId = req.params.dossierId;
    const senderId = req.user.dbUser.id;
    // For memoryStorage, files are in req.file.buffer - store as base64 or use cloud storage
    const fileUrl = req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` : null;
    const result = await query(
      `INSERT INTO messages (dossier_id, sender_id, content, file_url, created_at)
       VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
      [dossierId, senderId, content || '', fileUrl]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
