import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiFetch } from '../config/api.js';
import { Link } from 'react-router-dom';
import { Plus, ArrowRight } from 'lucide-react';

export default function Tickets() {
  const { dbUser, getToken } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [dossiers, setDossiers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    dossier_id: '',
    service_name: '',
    description: '',
    scope: '',
    conditions: '',
    price: '',
    deadline: ''
  });

  const serviceTypes = [
    'Analyse d’éligibilité Entrée Express',
    'Préparation dossier permis d’étude',
    'Accompagnement opportunité d’affaires',
    'Consultation personnalisée',
    'Montage de dossier complet'
  ];

  const statusLabel = {
    en_attente_paiement: 'En attente de paiement',
    payee: 'Payée',
    en_cours: 'En cours',
    termine: 'Terminée'
  };

  async function fetchTickets() {
    const token = await getToken();
    const res = await apiFetch('/api/tickets', { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setTickets(await res.json());
  }

  async function fetchDossiers() {
    const token = await getToken();
    const endpoint = dbUser?.role === 'conseiller' ? '/api/dossiers/conseiller/dossiers/all' : '/api/dossiers';
    const res = await apiFetch(endpoint, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setDossiers(await res.json());
  }

  useEffect(() => {
    if (dbUser) { fetchTickets(); fetchDossiers(); }
  }, [dbUser]);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    const token = await getToken();
    const res = await apiFetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, price: parseFloat(form.price) }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Erreur lors de la création de la requête');
      return;
    }
    setShowForm(false);
    setForm({ dossier_id: '', service_name: '', description: '', scope: '', conditions: '', price: '', deadline: '' });
    fetchTickets();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{dbUser?.role === 'conseiller' ? 'Paiements & Services' : 'Services à payer'}</h2>
        {dbUser?.role === 'conseiller' && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Créer une requête
          </button>
        )}
      </div>
      {showForm && (
        <form onSubmit={handleCreate} className="card-dark space-y-3">
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <select value={form.dossier_id} onChange={e => setForm({ ...form, dossier_id: e.target.value })} className="input-dark w-full" required>
            <option value="">Choisir un dossier accepté</option>
            {dossiers.filter(d => d.statut === 'accepte').map(d => (
              <option key={d.id} value={d.id}>Dossier #{d.id} - {d.programme}</option>
            ))}
          </select>
          <select value={form.service_name} onChange={e => setForm({ ...form, service_name: e.target.value })} className="input-dark w-full" required>
            <option value="">Type de service</option>
            {serviceTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description claire du service" className="input-dark w-full min-h-24" required />
          <textarea value={form.scope} onChange={e => setForm({ ...form, scope: e.target.value })} placeholder="Périmètre de l’intervention" className="input-dark w-full min-h-20" />
          <textarea value={form.conditions} onChange={e => setForm({ ...form, conditions: e.target.value })} placeholder="Conditions et livrables" className="input-dark w-full min-h-20" />
          <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="Prix (CAD)" className="input-dark w-full" required />
          <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="input-dark w-full" required />
          <button type="submit" className="btn-primary">Créer la requête</button>
        </form>
      )}
      <div className="space-y-3">
        {tickets.map(t => (
          <Link key={t.id} to={`/tickets/${t.id}`} className="card-dark flex items-center justify-between hover:border-capitune-white transition">
            <div>
              <p className="font-semibold">{t.service_name}</p>
              <p className="text-sm text-capitune-text">
                Dossier #{t.dossier_id} • {t.client_name || 'Client'} • {statusLabel[t.status] || t.status} • {t.price} $CAD
              </p>
            </div>
            <ArrowRight size={18} className="text-capitune-text" />
          </Link>
        ))}
        {tickets.length === 0 && <p className="text-capitune-text">Aucun ticket.</p>}
      </div>
    </div>
  );
}
