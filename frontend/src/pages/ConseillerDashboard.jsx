import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Check, X, FileText, User, Calendar, Bell, Download } from 'lucide-react';

export default function ConseillerDashboard() {
  const { dbUser, getToken } = useAuth();
  const [dossiers, setDossiers] = useState([]);
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [refusalReason, setRefusalReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function fetchDossiers() {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/conseiller/dossiers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setDossiers(await res.json());
    } catch (err) {
      setMessage('Erreur de chargement des dossiers');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (dbUser) fetchDossiers(); }, [dbUser]);

  const handleAccept = async (dossierId) => {
    setLoading(true);
    setMessage('');
    try {
      const token = await getToken();
      const res = await fetch(`/api/dossiers/${dossierId}/accepter`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMessage('Dossier accepté avec succès');
        fetchDossiers();
      } else {
        setMessage('Erreur lors de l\'acceptation');
      }
    } catch (err) {
      setMessage('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (dossierId) => {
    if (!refusalReason) {
      setMessage('Veuillez fournir un motif de refus');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const token = await getToken();
      const res = await fetch(`/api/dossiers/${dossierId}/refuser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ refusal_reason: refusalReason })
      });
      if (res.ok) {
        setMessage('Dossier refusé');
        setSelectedDossier(null);
        setRefusalReason('');
        fetchDossiers();
      } else {
        setMessage('Erreur lors du refus');
      }
    } catch (err) {
      setMessage('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const programmeLabel = {
    entree_express: 'Entrée Express',
    permis_etude: 'Permis d\'Études',
    affaires: 'Affaires'
  };

  const metierLabel = {
    developpeur: 'Développeur',
    ingenieur: 'Ingénieur',
    medecin: 'Médecin',
    infirmier: 'Infirmier',
    enseignant: 'Enseignant',
    comptable: 'Comptable',
    avocat: 'Avocat',
    gestionnaire: 'Gestionnaire',
    artisan: 'Artisan',
    commercial: 'Commercial',
    autre: 'Autre'
  };

  const domaineEtudesLabel = {
    informatique: 'Informatique',
    ingenierie: 'Ingénierie',
    sante: 'Santé',
    business: 'Business',
    droit: 'Droit',
    education: 'Éducation',
    arts: 'Arts',
    sciences: 'Sciences',
    autre: 'Autre'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Tableau de Bord Conseiller</h2>
          {dossiers.length > 0 && (
            <span className="flex items-center gap-1 px-3 py-1 bg-blue-600 rounded-full text-sm">
              <Bell size={16} />
              {dossiers.length}
            </span>
          )}
        </div>
        <div className="text-capitune-text">
          {dossiers.length} dossier{dossiers.length > 1 ? 's' : ''} reçu{dossiers.length > 1 ? 's' : ''}
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded ${message.includes('succès') || message === 'Dossier refusé' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
          {message}
        </div>
      )}

      {loading && dossiers.length === 0 ? (
        <div className="card-dark text-center py-8">
          <p className="text-capitune-text">Chargement...</p>
        </div>
      ) : dossiers.length === 0 ? (
        <div className="card-dark text-center py-8">
          <FileText size={48} className="text-capitune-text mx-auto mb-4" />
          <p className="text-capitune-text">Aucun dossier reçu</p>
        </div>
      ) : (
        <div className="space-y-4">
          {dossiers.map(dossier => (
            <div key={dossier.id} className="card-dark">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-600">
                      {programmeLabel[dossier.programme]}
                    </span>
                    <span className="text-sm text-capitune-text">
                      <Calendar size={14} className="inline mr-1" />
                      {new Date(dossier.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <User size={16} className="text-capitune-text" />
                    <span className="font-semibold">
                      {dossier.first_name} {dossier.last_name}
                    </span>
                    <span className="text-sm text-capitune-text">({dossier.email})</span>
                  </div>

                  {dossier.data && (
                    <div className="space-y-2 text-sm">
                      <div><span className="text-capitune-text">Nationalité:</span> {dossier.data.nationalite}</div>
                      <div><span className="text-capitune-text">Situation familiale:</span> {dossier.data.situation_familiale}</div>
                      <div><span className="text-capitune-text">Niveau d'études:</span> {dossier.data.niveau_etudes}</div>
                      <div><span className="text-capitune-text">Domaine d'études:</span> {domaineEtudesLabel[dossier.data.domaine_etudes] || dossier.data.domaine_etudes}</div>
                      <div><span className="text-capitune-text">Métier:</span> {metierLabel[dossier.data.metier] || dossier.data.metier}</div>
                      <div><span className="text-capitune-text">Années d'expérience:</span> {dossier.data.annees_experience}</div>
                      <div><span className="text-capitune-text">Motivation:</span> {dossier.data.motivation}</div>
                    </div>
                  )}

                  {dossier.file_url && (
                    <div className="mt-3">
                      <a
                        href={dossier.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
                      >
                        <Download size={16} />
                        Voir le CV
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(dossier.id)}
                    disabled={loading}
                    className="btn-primary p-2 bg-green-600 hover:bg-green-700"
                    title="Accepter"
                  >
                    <Check size={20} />
                  </button>
                  <button
                    onClick={() => setSelectedDossier(dossier)}
                    disabled={loading}
                    className="btn-outline p-2 border-red-500 text-red-500 hover:bg-red-900/20"
                    title="Refuser"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedDossier && (
        <div className="card-dark space-y-4">
          <h3 className="text-lg font-semibold">Motif de refus</h3>
          <textarea
            value={refusalReason}
            onChange={(e) => setRefusalReason(e.target.value)}
            placeholder="Expliquez le motif du refus..."
            className="input-dark w-full"
            rows={4}
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleReject(selectedDossier.id)}
              disabled={loading || !refusalReason}
              className="btn-primary bg-red-600 hover:bg-red-700"
            >
              Confirmer le Refus
            </button>
            <button
              onClick={() => {
                setSelectedDossier(null);
                setRefusalReason('');
              }}
              className="btn-outline"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
