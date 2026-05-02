import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';
import { Plus, ArrowRight } from 'lucide-react';

export default function Dossiers() {
  const { dbUser, getToken } = useAuth();
  const [dossiers, setDossiers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'express_entry', title: '', description: '' });

  async function fetchDossiers() {
    const token = await getToken();
    const res = await fetch('/api/dossiers', { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setDossiers(await res.json());
  }

  useEffect(() => { if (dbUser) fetchDossiers(); }, [dbUser]);

  async function handleCreate(e) {
    e.preventDefault();
    const token = await getToken();
    await fetch('/api/dossiers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm({ type: 'express_entry', title: '', description: '' });
    fetchDossiers();
  }

  const typeLabel = { express_entry: 'Entrée Express', study_permit: 'Permis d\'étude', business_opportunity: 'Opportunités d\'affaires' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dossiers</h2>
        {dbUser?.role === 'client' && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Nouveau
          </button>
        )}
      </div>
      {showForm && (
        <form onSubmit={handleCreate} className="card-dark space-y-3">
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="input-dark w-full">
            <option value="express_entry">Entrée Express</option>
            <option value="study_permit">Permis d'étude</option>
            <option value="business_opportunity">Opportunités d'affaires</option>
          </select>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Titre" className="input-dark w-full" required />
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" className="input-dark w-full" rows={3} />
          <button type="submit" className="btn-primary">Créer</button>
        </form>
      )}
      <div className="space-y-3">
        {dossiers.map(d => (
          <Link key={d.id} to={`/dossiers/${d.id}`} className="card-dark flex items-center justify-between hover:border-capitune-white transition">
            <div>
              <p className="font-semibold">{d.title}</p>
              <p className="text-sm text-capitune-text">{typeLabel[d.type]} • <span className="capitalize">{d.status}</span></p>
            </div>
            <ArrowRight size={18} className="text-capitune-text" />
          </Link>
        ))}
        {dossiers.length === 0 && <p className="text-capitune-text">Aucun dossier.</p>}
      </div>
    </div>
  );
}
