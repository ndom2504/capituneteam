import { Router } from 'express';
import { query } from '../config/db.js';
import { verifyToken, requireRole, loadUser } from '../middleware/auth.js';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

// Use memory storage for file uploads
const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.get('/', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const result = await query('SELECT id, email, display_name, first_name, last_name, role, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/conseillers', verifyToken, loadUser, async (req, res) => {
  try {
    const result = await query('SELECT id, email, display_name, first_name, last_name FROM users WHERE role = $1', ['conseiller']);
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

router.post('/upload-photo', verifyToken, loadUser, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.user.dbUser.id;

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'capitune/profiles',
          resource_type: 'image',
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto' },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    // Update user with Cloudinary URL
    const userResult = await query(
      'UPDATE users SET profile_photo_url = $1 WHERE id = $2 RETURNING *',
      [result.secure_url, userId]
    );

    res.json({ profile_photo_url: result.secure_url, user: userResult.rows[0] });
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    res.status(500).json({ error: 'Erreur lors de l\'upload de la photo' });
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
