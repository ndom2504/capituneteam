import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { apiFetch } from '../config/api.js';
import { ArrowLeft } from 'lucide-react';

export default function TicketDetail() {
  const { id } = useParams();
  const { dbUser, getToken } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState('');
  const [loadingPayment, setLoadingPayment] = useState(false);

  const statusLabel = {
    en_attente_paiement: 'En attente de paiement',
    payee: 'Payée',
    en_cours: 'En cours',
    termine: 'Terminée'
  };

  async function fetchTicket() {
    const token = await getToken();
    const res = await apiFetch(`/api/tickets/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setTicket(await res.json());
  }

  useEffect(() => { if (dbUser) fetchTicket(); }, [dbUser, id]);

  async function handlePayment() {
    setError('');
    setLoadingPayment(true);
    const token = await getToken();
    const res = await apiFetch('/api/payments/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ticket_id: id }),
    });
    if (res.ok) {
      const data = await res.json();
      window.location.href = data.url;
    } else {
      const data = await res.json();
      setError(data.error || 'Erreur lors de la création du paiement');
      setLoadingPayment(false);
    }
  }

  async function updateStatus(status) {
    setError('');
    const token = await getToken();
    const res = await apiFetch(`/api/tickets/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      fetchTicket();
    } else {
      const data = await res.json();
      setError(data.error || 'Erreur lors de la mise à jour');
    }
  }

  return (
    <div className="space-y-6">
      <Link to="/tickets" className="text-capitune-text hover:text-capitune-white flex items-center gap-2">
        <ArrowLeft size={18} /> Retour
      </Link>
      {ticket && (
        <div className="card-dark space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{ticket.service_name}</h2>
            <span className="text-sm bg-capitune-gray border border-capitune-border px-3 py-1 rounded-full">{statusLabel[ticket.status] || ticket.status}</span>
          </div>
          <p className="text-capitune-text">Dossier #{ticket.dossier_id}</p>
          {ticket.client_name && <p className="text-sm text-capitune-text">Client : {ticket.client_name}</p>}
          <p className="text-lg font-semibold">{ticket.price} $CAD</p>
          {ticket.deadline && <p className="text-sm text-capitune-text">Deadline: {new Date(ticket.deadline).toLocaleDateString('fr-CA')}</p>}
          {ticket.description && <div><p className="font-semibold">Description</p><p className="text-capitune-text">{ticket.description}</p></div>}
          {ticket.scope && <div><p className="font-semibold">Périmètre</p><p className="text-capitune-text">{ticket.scope}</p></div>}
          {ticket.conditions && <div><p className="font-semibold">Conditions</p><p className="text-capitune-text">{ticket.conditions}</p></div>}
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {dbUser?.role === 'client' && ticket.status === 'en_attente_paiement' && (
            <button onClick={handlePayment} className="btn-primary" disabled={loadingPayment}>
              {loadingPayment ? 'Redirection...' : 'Payer avec Stripe'}
            </button>
          )}
          {dbUser?.role === 'conseiller' && ticket.status === 'payee' && (
            <button onClick={() => updateStatus('en_cours')} className="btn-primary">Démarrer le service</button>
          )}
          {dbUser?.role === 'conseiller' && ticket.status === 'en_cours' && (
            <button onClick={() => updateStatus('termine')} className="btn-primary">Marquer comme terminé</button>
          )}
        </div>
      )}
    </div>
  );
}
