import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Edit, Trash2 } from 'lucide-react';

export default function Dossiers() {
  const { dbUser, getToken } = useAuth();
  const navigate = useNavigate();
  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    async function fetchDossiers() {
      if (!dbUser) return;
      setLoading(true);
      try {
        const token = await getToken();
        const res = await fetch('/api/dossiers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setDossiers(await res.json());
      } catch (err) {
        console.error('Error fetching dossiers:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDossiers();
  }, [dbUser, getToken]);

  const handleDelete = async (dossierId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce dossier ?')) return;
    setDeletingId(dossierId);
    try {
      const token = await getToken();
      const res = await fetch(`/api/dossiers/${dossierId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setDossiers(dossiers.filter(d => d.id !== dossierId));
      }
    } catch (err) {
      console.error('Error deleting dossier:', err);
    } finally {
      setDeletingId(null);
    }
  };

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
        <button
          onClick={() => navigate('/dossiers/create')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Nouveau Dossier
        </button>
      </div>

      {loading ? (
        <div className="card-dark text-center py-8">
          <p className="text-capitune-text">Chargement...</p>
        </div>
      ) : dossiers.length === 0 ? (
        <div className="card-dark text-center py-8">
          <FileText size={48} className="text-capitune-text mx-auto mb-4" />
          <p className="text-capitune-text">Aucun dossier</p>
          <button
            onClick={() => navigate('/dossiers/create')}
            className="btn-primary mt-4"
          >
            Créer un dossier
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {dossiers.map(dossier => (
            <div key={dossier.id} className="card-dark">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${statutColor[dossier.statut]}`}>
                      {statutLabel[dossier.statut]}
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-600">
                      {programmeLabel[dossier.programme]}
                    </span>
                  </div>

                  {dossier.data && (
                    <div className="space-y-1 text-sm">
                      <div><span className="text-capitune-text">Nom:</span> {dossier.data.nom} {dossier.data.prenom}</div>
                      <div><span className="text-capitune-text">Nationalité:</span> {dossier.data.nationalite}</div>
                    </div>
                  )}

                  {dossier.refusal_reason && (
                    <div className="mt-2 p-2 bg-red-900/20 rounded text-sm text-red-300">
                      <span className="font-semibold">Motif de refus:</span> {dossier.refusal_reason}
                    </div>
                  )}
                </div>

                {dossier.statut === 'brouillon' && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => navigate(`/dossiers/${dossier.id}/edit`)}
                      className="btn-outline p-2"
                      title="Modifier"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(dossier.id)}
                      disabled={deletingId === dossier.id}
                      className="btn-outline p-2 border-red-500 text-red-500 hover:bg-red-900/20"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
