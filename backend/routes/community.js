import { Router } from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import { query } from '../config/db.js';
import { verifyToken, requireRole, loadUser } from '../middleware/auth.js';

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});
const router = Router();

async function ensureCommunityTables() {
  await query(`CREATE TABLE IF NOT EXISTS community_posts (
    id SERIAL PRIMARY KEY,
    author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255),
    content TEXT,
    media_url VARCHAR(500),
    media_type VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
  )`);
  await query(`CREATE TABLE IF NOT EXISTS community_comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  )`);
  await query(`CREATE TABLE IF NOT EXISTS community_likes (
    post_id INTEGER REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
  )`);
}

router.get('/', verifyToken, loadUser, async (req, res) => {
  try {
    await ensureCommunityTables();
    const userId = req.user.dbUser?.id || 0;
    const result = await query(
      `SELECT p.*,
              COALESCE(NULLIF(TRIM(CONCAT(u.first_name, ' ', u.last_name)), ''), u.display_name, u.email) as author_name,
              u.profile_photo_url as author_photo_url,
              COUNT(DISTINCT l.user_id)::int as likes_count,
              COUNT(DISTINCT c.id)::int as comments_count,
              BOOL_OR(l.user_id = $1) as liked_by_me
       FROM community_posts p
       LEFT JOIN users u ON p.author_id = u.id
       LEFT JOIN community_likes l ON l.post_id = p.id
       LEFT JOIN community_comments c ON c.post_id = p.id
       GROUP BY p.id, u.first_name, u.last_name, u.display_name, u.email, u.profile_photo_url
       ORDER BY p.created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', verifyToken, requireRole(['conseiller', 'admin']), loadUser, upload.single('media'), async (req, res) => {
  try {
    await ensureCommunityTables();
    const { title, content } = req.body;
    let mediaUrl = null;
    let mediaType = null;

    if (req.file) {
      const isVideo = req.file.mimetype.startsWith('video/');
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'capitune/community',
            resource_type: isVideo ? 'video' : 'image',
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'webm']
          },
          (error, uploadResult) => {
            if (error) reject(error);
            else resolve(uploadResult);
          }
        ).end(req.file.buffer);
      });
      mediaUrl = result.secure_url;
      mediaType = isVideo ? 'video' : 'image';
    }

    if (!title && !content && !mediaUrl) {
      return res.status(400).json({ error: 'Ajoutez un titre, un texte ou un média' });
    }

    const result = await query(
      `INSERT INTO community_posts (author_id, title, content, media_url, media_type, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
      [req.user.dbUser.id, title || '', content || '', mediaUrl, mediaType]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:postId/comments', verifyToken, loadUser, async (req, res) => {
  try {
    await ensureCommunityTables();
    const result = await query(
      `SELECT c.*,
              COALESCE(NULLIF(TRIM(CONCAT(u.first_name, ' ', u.last_name)), ''), u.display_name, u.email) as user_name,
              u.profile_photo_url as user_photo_url
       FROM community_comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.post_id = $1
       ORDER BY c.created_at ASC`,
      [req.params.postId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:postId/comments', verifyToken, loadUser, async (req, res) => {
  try {
    await ensureCommunityTables();
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Commentaire requis' });
    const result = await query(
      `INSERT INTO community_comments (post_id, user_id, content, created_at)
       VALUES ($1, $2, $3, NOW()) RETURNING *`,
      [req.params.postId, req.user.dbUser.id, content.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:postId/like', verifyToken, loadUser, async (req, res) => {
  try {
    await ensureCommunityTables();
    const existing = await query('SELECT 1 FROM community_likes WHERE post_id = $1 AND user_id = $2', [req.params.postId, req.user.dbUser.id]);
    if (existing.rows.length) {
      await query('DELETE FROM community_likes WHERE post_id = $1 AND user_id = $2', [req.params.postId, req.user.dbUser.id]);
      return res.json({ liked: false });
    }
    await query('INSERT INTO community_likes (post_id, user_id, created_at) VALUES ($1, $2, NOW())', [req.params.postId, req.user.dbUser.id]);
    res.json({ liked: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
