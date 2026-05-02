import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ArrowLeft, MessageSquare } from 'lucide-react';

export default function DossierDetail() {
  const { id } = useParams();
  const { dbUser, getToken } = useAuth();
  const [dossier, setDossier] = useState(null);
  const [conseillers, setConseillers] = useState([]);

  async function fetchDossier() {
    const token = await getToken();
    const res = await fetch(`/api/dossiers/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setDossier(await res.json());
  }

  async function fetchConseillers() {
    const token = await getToken();
    const res = await fetch('/api/users/conseillers', { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setConseillers(await res.json());
  }

  useEffect(() => { if (dbUser) fetchDossier(); }, [dbUser, id]);

  async function handleAssign(cid) {
    const token = await getToken();
    await fetch(`/api/dossiers/${id}/assign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: 'accepted', conseiller_id: cid }),
    });
    fetchDossier();
  }

  async function handleReject() {
    const token = await getToken();
    await fetch(`/api/dossiers/${id}/assign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: 'rejected' }),
    });
    fetchDossier();
  }

  const typeLabel = { express_entry: 'Entrée Express', study_permit: 'Permis d\'étude', business_opportunity: 'Opportunités d\'affaires' };

  return (
    <div className="space-y-6">
      <Link to="/dossiers" className="text-capitune-text hover:text-capitune-white flex items-center gap-2">
        <ArrowLeft size={18} /> Retour
      </Link>
      {dossier && (
        <div className="card-dark space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{dossier.title}</h2>
            <span className="text-sm bg-capitune-gray border border-capitune-border px-3 py-1 rounded-full capitalize">{dossier.status}</span>
          </div>
          <p className="text-capitune-text">{typeLabel[dossier.type]}</p>
          <p>{dossier.description}</p>

          {dbUser?.role === 'conseiller' && dossier.status === 'pending' && (
            <div className="flex gap-3">
              <button onClick={() => handleAssign(dbUser.id)} className="btn-primary">Accepter</button>
              <button onClick={handleReject} className="btn-outline">Refuser</button>
            </div>
          )}

          {dbUser?.role === 'admin' && dossier.status === 'pending' && (
            <div className="space-y-2">
              <p className="text-sm text-capitune-text">Assigner à un conseiller :</p>
              <div className="flex flex-wrap gap-2">
                {conseillers.map(c => (
                  <button key={c.id} onClick={() => handleAssign(c.id)} className="btn-outline text-sm">
                    {c.display_name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Link to={`/messages/${dossier.id}`} className="btn-outline flex items-center gap-2 w-fit">
            <MessageSquare size={18} /> Messagerie
          </Link>
        </div>
      )}
    </div>
  );
}
