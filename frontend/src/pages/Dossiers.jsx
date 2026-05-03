import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';
import { Plus, ArrowRight, FileText } from 'lucide-react';

export default function Dossiers() {
  const { dbUser, getToken } = useAuth();
  const [dossiers, setDossiers] = useState([]);

  async function fetchDossiers() {
    const token = await getToken();
    const res = await fetch('/api/dossiers', { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setDossiers(await res.json());
  }

  useEffect(() => { if (dbUser) fetchDossiers(); }, [dbUser]);

  const programmeLabel = {
    entree_express: 'Entrée Express',
    permis_etude: 'Permis d\'Études',
    affaires: 'Affaires'
  };

  const statutLabel = {
    brouillon: 'Brouillon',
    envoye: 'Envoyé',
    accepte: 'Accepté',
    refuse: 'Refusé'
  };

  const statutColor = {
    brouillon: 'bg-gray-600',
    envoye: 'bg-blue-600',
    accepte: 'bg-green-600',
    refuse: 'bg-red-600'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mes Dossiers</h2>
        {dbUser?.role === 'client' && (
          <Link to="/dossiers/create" className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Nouveau Dossier
          </Link>
        )}
      </div>

      <div className="space-y-3">
        {dossiers.map(d => (
          <Link key={d.id} to={`/dossiers/${d.id}`} className="card-dark flex items-center justify-between hover:border-capitune-white transition">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-capitune-border rounded-lg">
                <FileText size={24} className="text-capitune-text" />
              </div>
              <div>
                <p className="font-semibold">{programmeLabel[d.programme]}</p>
                <p className="text-sm text-capitune-text">
                  {new Date(d.created_at).toLocaleDateString('fr-FR')} •
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${statutColor[d.statut]}`}>
                    {statutLabel[d.statut]}
                  </span>
                </p>
                {d.refusal_reason && (
                  <p className="text-sm text-red-400 mt-1">Refusé: {d.refusal_reason}</p>
                )}
              </div>
            </div>
            <ArrowRight size={18} className="text-capitune-text" />
          </Link>
        ))}
        {dossiers.length === 0 && (
          <div className="card-dark text-center py-8">
            <FileText size={48} className="text-capitune-text mx-auto mb-4" />
            <p className="text-capitune-text">Aucun dossier pour le moment</p>
            {dbUser?.role === 'client' && (
              <Link to="/dossiers/create" className="btn-primary inline-flex items-center gap-2 mt-4">
                <Plus size={18} /> Créer un Dossier
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
