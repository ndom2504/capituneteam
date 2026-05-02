import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ArrowLeft } from 'lucide-react';

export default function TicketDetail() {
  const { id } = useParams();
  const { dbUser, getToken } = useAuth();
  const [ticket, setTicket] = useState(null);

  async function fetchTicket() {
    const token = await getToken();
    const res = await fetch(`/api/tickets/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setTicket(await res.json());
  }

  useEffect(() => { if (dbUser) fetchTicket(); }, [dbUser, id]);

  async function handlePayment() {
    const token = await getToken();
    const res = await fetch('/api/payments/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ticket_id: id }),
    });
    if (res.ok) {
      const data = await res.json();
      window.location.href = data.url;
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
            <span className="text-sm bg-capitune-gray border border-capitune-border px-3 py-1 rounded-full capitalize">{ticket.status}</span>
          </div>
          <p className="text-capitune-text">Dossier #{ticket.dossier_id}</p>
          <p className="text-lg font-semibold">{ticket.price} $CAD</p>
          {ticket.deadline && <p className="text-sm text-capitune-text">Deadline: {new Date(ticket.deadline).toLocaleDateString('fr-CA')}</p>}
          {dbUser?.role === 'client' && ticket.status === 'open' && (
            <button onClick={handlePayment} className="btn-primary">Payer avec Stripe</button>
          )}
        </div>
      )}
    </div>
  );
}
