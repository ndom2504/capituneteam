import { Router } from 'express';
import { query } from '../config/db.js';
import { verifyToken, loadUser } from '../middleware/auth.js';
import multer from 'multer';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uploadDir = join(__dirname, '..', 'uploads');
try { mkdirSync(uploadDir); } catch (e) {}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`;
    cb(null, unique);
  },
});
const upload = multer({ storage });

const router = Router();

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
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
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
