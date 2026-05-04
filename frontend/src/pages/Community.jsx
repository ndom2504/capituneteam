import { useEffect, useState } from 'react';
import { apiFetch } from '../config/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Heart, ImagePlus, MessageCircle, Send, Users } from 'lucide-react';

function ProfileBubble({ name, photoUrl }) {
  const initials = (name || '?').split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  return (
    <div className="w-10 h-10 rounded-full overflow-hidden bg-capitune-gray border border-capitune-border flex items-center justify-center text-xs font-bold shrink-0">
      {photoUrl ? <img src={photoUrl} alt={name || 'Profil'} className="w-full h-full object-cover" /> : initials}
    </div>
  );
}

export default function Community() {
  const { dbUser, getToken } = useAuth();
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [replyTo, setReplyTo] = useState({});
  const [form, setForm] = useState({ title: '', content: '' });
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const canPublish = dbUser?.role === 'conseiller' || dbUser?.role === 'admin';
  const isAdviser = dbUser?.role === 'conseiller' || dbUser?.role === 'admin';

  async function authHeaders() {
    const token = await getToken();
    return { Authorization: `Bearer ${token}` };
  }

  async function fetchPosts() {
    const headers = await authHeaders();
    const res = await apiFetch('/api/community', { headers });
    if (res.ok) setPosts(await res.json());
  }

  async function fetchComments(postId) {
    const headers = await authHeaders();
    const res = await apiFetch(`/api/community/${postId}/comments`, { headers });
    if (res.ok) setComments({ ...comments, [postId]: await res.json() });
  }

  useEffect(() => {
    if (dbUser) fetchPosts();
  }, [dbUser]);

  async function handlePublish(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      let mediaUrl = null;
      let mediaType = null;

      // 1. Upload media directly to Cloudinary (unsigned upload using preset)
      if (media) {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
          throw new Error('Variables d\'environnement Cloudinary non configurées');
        }

        const cloudForm = new FormData();
        cloudForm.append('file', media);
        cloudForm.append('upload_preset', uploadPreset);
        cloudForm.append('folder', 'capitune/community');

        // Cloudinary détecte automatiquement le type (image ou video)
        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
          method: 'POST',
          body: cloudForm,
        });
        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          throw new Error(errData.error?.message || 'Erreur lors de l\'upload du média');
        }
        const uploadData = await uploadRes.json();
        mediaUrl = uploadData.secure_url;
        mediaType = uploadData.resource_type; // 'image' or 'video'
      }

      // 2. Create post with media URL
      const token = await getToken();
      const res = await apiFetch('/api/community', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          content: form.content,
          media_url: mediaUrl,
          media_type: mediaType,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la publication');
      }
      setForm({ title: '', content: '' });
      setMedia(null);
      setMessage('Publication ajoutée avec succès');
      fetchPosts();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleLike(postId) {
    const headers = await authHeaders();
    const res = await apiFetch(`/api/community/${postId}/like`, { method: 'POST', headers });
    if (res.ok) fetchPosts();
  }

  async function addComment(postId) {
    const content = commentText[postId]?.trim();
    if (!content) return;
    const headers = await authHeaders();
    const res = await apiFetch(`/api/community/${postId}/comments`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      setCommentText({ ...commentText, [postId]: '' });
      setReplyTo({ ...replyTo, [postId]: null });
      fetchComments(postId);
      fetchPosts();
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="card-dark space-y-3">
        <div className="flex items-center gap-3">
          <Users size={28} />
          <div>
            <h2 className="text-2xl font-bold">Communauté</h2>
            <p className="text-capitune-text">Publications, images et vidéos sur les thématiques du Canada.</p>
          </div>
        </div>
      </div>

      {canPublish && (
        <form onSubmit={handlePublish} className="card-dark space-y-4">
          <h3 className="font-semibold">Créer une publication</h3>
          {message && <p className="text-sm text-capitune-text">{message}</p>}
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-dark w-full" placeholder="Titre de la publication" />
          <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className="input-dark w-full min-h-28" placeholder="Partagez un conseil, une expérience ou une information utile sur le Canada..." />
          <label className="btn-outline cursor-pointer inline-flex items-center gap-2">
            <ImagePlus size={18} /> Ajouter image ou vidéo
            <input type="file" accept="image/*,video/*" className="hidden" onChange={e => setMedia(e.target.files[0])} />
          </label>
          {media && <p className="text-xs text-capitune-text">{media.name}</p>}
          <button className="btn-primary" disabled={loading}>{loading ? 'Publication...' : 'Publier'}</button>
        </form>
      )}

      <div className="space-y-4">
        {posts.map(post => (
          <article key={post.id} className="card-dark space-y-4">
            <div className="flex items-center gap-3">
              <ProfileBubble name={post.author_name} photoUrl={post.author_photo_url} />
              <div>
                <p className="font-semibold">{post.author_name || 'Conseiller'}</p>
                <p className="text-xs text-capitune-text">{new Date(post.created_at).toLocaleString('fr-CA')}</p>
              </div>
            </div>
            {post.title && <h3 className="text-xl font-bold">{post.title}</h3>}
            {post.content && <p className="text-capitune-text whitespace-pre-wrap">{post.content}</p>}
            {post.media_url && post.media_type === 'image' && <img src={post.media_url} alt={post.title || 'Publication'} className="rounded-xl w-full max-h-[520px] object-cover border border-capitune-border" />}
            {post.media_url && post.media_type === 'video' && <video src={post.media_url} controls className="rounded-xl w-full border border-capitune-border" />}
            <div className="flex items-center gap-3 border-t border-capitune-border pt-3">
              <button onClick={() => toggleLike(post.id)} className={`btn-outline text-sm ${post.liked_by_me ? 'border-red-500 text-red-500' : ''}`}>
                <Heart size={16} fill={post.liked_by_me ? 'currentColor' : 'none'} /> {post.likes_count || 0}
              </button>
              <button onClick={() => fetchComments(post.id)} className="btn-outline text-sm">
                <MessageCircle size={16} /> {post.comments_count || 0}
              </button>
            </div>
            {comments[post.id] && (
              <div className="space-y-3">
                {comments[post.id].map(comment => (
                  <div key={comment.id} className="flex gap-3 bg-capitune-gray/40 border border-capitune-border rounded-xl p-3">
                    <ProfileBubble name={comment.user_name} photoUrl={comment.user_photo_url} />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-semibold">{comment.user_name || 'Utilisateur'}</p>
                        {isAdviser && (
                          <button onClick={() => setReplyTo({ ...replyTo, [post.id]: comment.id })} className="text-xs text-capitune-text hover:text-capitune-white">
                            Répondre
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-capitune-text">{comment.content}</p>
                    </div>
                  </div>
                ))}
                {replyTo[post.id] && (
                  <div className="bg-capitune-gray/60 border border-capitune-border rounded-xl p-3">
                    <p className="text-xs text-capitune-text mb-2">Répondre à un commentaire</p>
                    <div className="flex gap-2">
                      <input value={commentText[post.id] || ''} onChange={e => setCommentText({ ...commentText, [post.id]: e.target.value })} className="input-dark flex-1" placeholder="Écrire une réponse..." />
                      <button onClick={() => addComment(post.id)} className="btn-primary"><Send size={16} /></button>
                      <button onClick={() => setReplyTo({ ...replyTo, [post.id]: null })} className="btn-outline">Annuler</button>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <input value={commentText[post.id] || ''} onChange={e => setCommentText({ ...commentText, [post.id]: e.target.value })} className="input-dark flex-1" placeholder="Ajouter un commentaire..." />
                  <button onClick={() => addComment(post.id)} className="btn-primary"><Send size={16} /></button>
                </div>
              </div>
            )}
          </article>
        ))}
        {posts.length === 0 && <div className="card-dark text-center text-capitune-text">Aucune publication pour le moment.</div>}
      </div>
    </div>
  );
}
