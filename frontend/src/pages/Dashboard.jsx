import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiFetch } from '../config/api.js';
import { Link } from 'react-router-dom';
import { FolderOpen, Ticket, MessageSquare } from 'lucide-react';

export default function Dashboard() {
  const { dbUser, getToken } = useAuth();
  const [stats, setStats] = useState({ dossiers: 0, tickets: 0, messages: 0 });

  useEffect(() => {
    async function fetchStats() {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const [d, t] = await Promise.all([
          apiFetch('/api/dossiers', { headers }).then(r => r.ok ? r.json() : []),
          apiFetch('/api/tickets', { headers }).then(r => r.ok ? r.json() : []),
        ]);
        setStats({ dossiers: d.length || 0, tickets: t.length || 0, messages: 0 });
      } catch {}
    }
    if (dbUser) fetchStats();
  }, [dbUser, getToken]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Tableau de bord</h2>
      <p className="text-capitune-text">Bienvenue, {dbUser?.display_name}.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/dossiers" className="card-dark hover:border-capitune-white transition">
          <div className="flex items-center gap-3 mb-2">
            <FolderOpen size={24} />
            <span className="text-lg font-semibold">Dossiers</span>
          </div>
          <p className="text-capitune-text">{stats.dossiers} dossier(s)</p>
        </Link>
        <Link to="/tickets" className="card-dark hover:border-capitune-white transition">
          <div className="flex items-center gap-3 mb-2">
            <Ticket size={24} />
            <span className="text-lg font-semibold">Services</span>
          </div>
          <p className="text-capitune-text">{stats.tickets} ticket(s)</p>
        </Link>
        <Link to="/messages" className="card-dark hover:border-capitune-white transition">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare size={24} />
            <span className="text-lg font-semibold">Messages</span>
          </div>
          <p className="text-capitune-text">Messagerie</p>
        </Link>
      </div>
    </div>
  );
}
