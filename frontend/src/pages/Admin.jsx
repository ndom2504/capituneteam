import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiFetch } from '../config/api.js';
import { Shield, Users, FolderOpen, CreditCard, MessageSquare } from 'lucide-react';

const userStatuses = [
  ['active', 'Actif'],
  ['pending', 'En attente'],
  ['suspended', 'Suspendu'],
  ['disabled', 'Désactivé'],
];

const roles = [
  ['client', 'Client'],
  ['conseiller', 'Conseiller'],
  ['admin', 'Admin'],
];

const dossierStatuses = [
  ['brouillon', 'Brouillon'],
  ['envoye', 'Envoyé'],
  ['accepte', 'Accepté'],
  ['refuse', 'Refusé'],
];

const paymentStatuses = [
  ['initie', 'Initié'],
  ['reussi', 'Réussi'],
  ['echec', 'Échec'],
  ['rembourse', 'Remboursé'],
];

function fullName(item, prefix) {
  const name = `${item[`${prefix}_first_name`] || ''} ${item[`${prefix}_last_name`] || ''}`.trim();
  return name || item[`${prefix}_email`] || '-';
}

export default function Admin() {
  const { dbUser, getToken } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [dossiers, setDossiers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [posts, setPosts] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  async function authHeaders() {
    const token = await getToken();
    return { Authorization: `Bearer ${token}` };
  }

  async function loadAdminData() {
    setLoading(true);
    setMessage('');
    try {
      const headers = await authHeaders();
      await apiFetch('/api/admin/migrate', { method: 'POST', headers });
      const [overviewRes, usersRes, dossiersRes, paymentsRes, postsRes] = await Promise.all([
        apiFetch('/api/admin/overview', { headers }),
        apiFetch('/api/admin/users', { headers }),
        apiFetch('/api/admin/dossiers', { headers }),
        apiFetch('/api/admin/payments', { headers }),
        apiFetch('/api/community', { headers }),
      ]);
      if (overviewRes.ok) setOverview(await overviewRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (dossiersRes.ok) setDossiers(await dossiersRes.json());
      if (paymentsRes.ok) setPayments(await paymentsRes.json());
      if (postsRes.ok) setPosts(await postsRes.json());
    } catch {
      setMessage('Erreur de chargement du panneau admin');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (dbUser?.role === 'admin') loadAdminData();
  }, [dbUser]);

  async function updateUser(id, payload) {
    const headers = await authHeaders();
    const res = await apiFetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const updated = await res.json();
      setUsers(users.map(user => user.id === id ? updated : user));
      setMessage('Utilisateur mis à jour');
    }
  }

  async function updateDossier(id, payload) {
    const headers = await authHeaders();
    const res = await apiFetch(`/api/admin/dossiers/${id}`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      await loadAdminData();
      setMessage('Dossier mis à jour');
    }
  }

  async function updatePayment(id, status) {
    const headers = await authHeaders();
    const res = await apiFetch(`/api/admin/payments/${id}`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      await loadAdminData();
      setMessage('Paiement mis à jour');
    }
  }

  async function deletePost(id) {
    const headers = await authHeaders();
    const res = await apiFetch(`/api/community/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (res.ok) {
      setPosts(posts.filter(p => p.id !== id));
      setMessage('Publication supprimée');
    }
  }

  if (dbUser?.role !== 'admin') {
    return <div className="card-dark">Accès réservé aux administrateurs.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield size={28} />
        <div>
          <h2 className="text-2xl font-bold">Administration</h2>
          <p className="text-capitune-text">Centre de contrôle des utilisateurs, dossiers et paiements.</p>
        </div>
      </div>

      {message && <div className="card-dark border-capitune-border text-sm">{message}</div>}

      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card-dark"><p className="text-capitune-text text-sm">Utilisateurs</p><p className="text-2xl font-bold">{overview.users}</p></div>
          <div className="card-dark"><p className="text-capitune-text text-sm">Dossiers</p><p className="text-2xl font-bold">{overview.dossiers}</p></div>
          <div className="card-dark"><p className="text-capitune-text text-sm">Services</p><p className="text-2xl font-bold">{overview.tickets}</p></div>
          <div className="card-dark"><p className="text-capitune-text text-sm">Payé</p><p className="text-2xl font-bold">{Number(overview.paidAmount).toFixed(2)} CAD</p></div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setActiveTab('users')} className={activeTab === 'users' ? 'btn-primary' : 'btn-outline'}><Users size={16} /> Utilisateurs</button>
        <button onClick={() => setActiveTab('dossiers')} className={activeTab === 'dossiers' ? 'btn-primary' : 'btn-outline'}><FolderOpen size={16} /> Dossiers</button>
        <button onClick={() => setActiveTab('payments')} className={activeTab === 'payments' ? 'btn-primary' : 'btn-outline'}><CreditCard size={16} /> Paiements</button>
        <button onClick={() => setActiveTab('posts')} className={activeTab === 'posts' ? 'btn-primary' : 'btn-outline'}><MessageSquare size={16} /> Publications</button>
      </div>

      {loading && <div className="card-dark">Chargement...</div>}

      {!loading && activeTab === 'users' && (
        <div className="card-dark overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-capitune-text"><th className="p-2">Nom</th><th className="p-2">Email</th><th className="p-2">Rôle</th><th className="p-2">Statut</th></tr></thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-t border-capitune-border">
                  <td className="p-2">{`${user.first_name || ''} ${user.last_name || ''}`.trim() || user.display_name || '-'}</td>
                  <td className="p-2">{user.email}</td>
                  <td className="p-2"><select className="input-dark" value={user.role} onChange={(e) => updateUser(user.id, { role: e.target.value })}>{roles.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td>
                  <td className="p-2"><select className="input-dark" value={user.account_status || 'active'} onChange={(e) => updateUser(user.id, { account_status: e.target.value })}>{userStatuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && activeTab === 'dossiers' && (
        <div className="card-dark overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-capitune-text"><th className="p-2">ID</th><th className="p-2">Client</th><th className="p-2">Conseiller</th><th className="p-2">Programme</th><th className="p-2">Statut</th></tr></thead>
            <tbody>
              {dossiers.map(dossier => (
                <tr key={dossier.id} className="border-t border-capitune-border">
                  <td className="p-2">#{dossier.id}</td>
                  <td className="p-2">{fullName(dossier, 'client')}</td>
                  <td className="p-2">{fullName(dossier, 'conseiller')}</td>
                  <td className="p-2">{dossier.programme}</td>
                  <td className="p-2"><select className="input-dark" value={dossier.statut} onChange={(e) => updateDossier(dossier.id, { statut: e.target.value })}>{dossierStatuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && activeTab === 'payments' && (
        <div className="card-dark overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-capitune-text"><th className="p-2">Service</th><th className="p-2">Client</th><th className="p-2">Conseiller</th><th className="p-2">Montant</th><th className="p-2">Statut</th></tr></thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment.id} className="border-t border-capitune-border">
                  <td className="p-2">{payment.service_name}</td>
                  <td className="p-2">{fullName(payment, 'client')}</td>
                  <td className="p-2">{fullName(payment, 'conseiller')}</td>
                  <td className="p-2">{Number(payment.amount).toFixed(2)} CAD</td>
                  <td className="p-2"><select className="input-dark" value={payment.status} onChange={(e) => updatePayment(payment.id, e.target.value)}>{paymentStatuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && activeTab === 'posts' && (
        <div className="card-dark space-y-4">
          <h3 className="font-semibold">Publications de la communauté</h3>
          {posts.length === 0 ? <p className="text-capitune-text">Aucune publication.</p> : (
            <div className="space-y-3">
              {posts.map(post => (
                <div key={post.id} className="border border-capitune-border rounded-xl p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{post.author_name || 'Conseiller'}</p>
                      <p className="text-xs text-capitune-text">{new Date(post.created_at).toLocaleString('fr-CA')}</p>
                    </div>
                    <button onClick={() => deletePost(post.id)} className="btn-outline text-xs text-red-400 border-red-400 hover:bg-red-400/20">Supprimer</button>
                  </div>
                  {post.title && <h4 className="font-bold">{post.title}</h4>}
                  {post.content && <p className="text-capitune-text text-sm">{post.content}</p>}
                  {post.media_url && post.media_type === 'image' && <img src={post.media_url} alt="" className="rounded-lg max-h-40 w-auto" />}
                  {post.media_url && post.media_type === 'video' && <video src={post.media_url} controls className="rounded-lg max-h-40 w-auto" />}
                  <p className="text-xs text-capitune-text">{post.likes_count || 0} likes • {post.comments_count || 0} commentaires</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
