import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';
import { Plus, ArrowRight } from 'lucide-react';

export default function Tickets() {
  const { dbUser, getToken } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [dossiers, setDossiers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ dossier_id: '', service_name: '', price: '', deadline: '' });

  async function fetchTickets() {
    const token = await getToken();
    const res = await fetch('/api/tickets', { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setTickets(await res.json());
  }

  async function fetchDossiers() {
    const token = await getToken();
    const res = await fetch('/api/dossiers', { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setDossiers(await res.json());
  }

  useEffect(() => {
    if (dbUser) { fetchTickets(); fetchDossiers(); }
  }, [dbUser]);

  async function handleCreate(e) {
    e.preventDefault();
    const token = await getToken();
    await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, price: parseFloat(form.price) }),
    });
    setShowForm(false);
    setForm({ dossier_id: '', service_name: '', price: '', deadline: '' });
    fetchTickets();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tickets de service</h2>
        {dbUser?.role === 'conseiller' && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Nouveau
          </button>
        )}
      </div>
      {showForm && (
        <form onSubmit={handleCreate} className="card-dark space-y-3">
          <select value={form.dossier_id} onChange={e => setForm({ ...form, dossier_id: e.target.value })} className="input-dark w-full" required>
            <option value="">Choisir un dossier</option>
            {dossiers.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
          </select>
          <input value={form.service_name} onChange={e => setForm({ ...form, service_name: e.target.value })} placeholder="Service" className="input-dark w-full" required />
          <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="Prix (CAD)" className="input-dark w-full" required />
          <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="input-dark w-full" required />
          <button type="submit" className="btn-primary">Créer</button>
        </form>
      )}
      <div className="space-y-3">
        {tickets.map(t => (
          <Link key={t.id} to={`/tickets/${t.id}`} className="card-dark flex items-center justify-between hover:border-capitune-white transition">
            <div>
              <p className="font-semibold">{t.service_name}</p>
              <p className="text-sm text-capitune-text">{t.dossier_title} • <span className="capitalize">{t.status}</span> • {t.price} $CAD</p>
            </div>
            <ArrowRight size={18} className="text-capitune-text" />
          </Link>
        ))}
        {tickets.length === 0 && <p className="text-capitune-text">Aucun ticket.</p>}
      </div>
    </div>
  );
}
