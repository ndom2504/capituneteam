import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ArrowLeft, MessageSquare, Download, Check, X, User, Calendar } from 'lucide-react';

export default function DossierDetail() {
  const { id } = useParams();
  const { dbUser, getToken } = useAuth();
  const [dossier, setDossier] = useState(null);
  const [refusalReason, setRefusalReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function fetchDossier() {
    const token = await getToken();
    const res = await fetch(`/api/dossiers/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setDossier(await res.json());
  }

  useEffect(() => { if (dbUser) fetchDossier(); }, [dbUser, id]);

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
        fetchDossier();
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
        setRefusalReason('');
        fetchDossier();
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

  const statutLabel = {
    brouillon: 'Brouillon',
    envoye: 'Envoyé',
    accepte: 'Accepté',
    refuse: 'Refusé'
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
    <div className="space-y-6 max-w-3xl">
      <Link to={dbUser?.role === 'conseiller' ? '/conseiller' : '/dossiers'} className="text-capitune-text hover:text-capitune-white flex items-center gap-2">
        <ArrowLeft size={18} /> Retour
      </Link>

      {message && (
        <div className={`p-3 rounded ${message.includes('succès') || message === 'Dossier refusé' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
          {message}
        </div>
      )}

      {loading && !dossier && (
        <div className="card-dark text-center py-8">
          <p className="text-capitune-text">Chargement...</p>
        </div>
      )}

      {!loading && !dossier && (
        <div className="card-dark text-center py-8">
          <p className="text-capitune-text">Dossier non trouvé</p>
        </div>
      )}

      {dossier && (
        <div className="card-dark space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Dossier #{dossier.id}</h2>
            <span className="text-sm bg-capitune-gray border border-capitune-border px-3 py-1 rounded-full">
              {statutLabel[dossier.statut] || dossier.statut}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs rounded-full bg-blue-600">
              {programmeLabel[dossier.programme] || dossier.programme}
            </span>
            <span className="text-sm text-capitune-text">
              <Calendar size={14} className="inline mr-1" />
              {dossier.created_at ? new Date(dossier.created_at).toLocaleDateString('fr-FR') : 'N/A'}
            </span>
          </div>

          {dossier.data && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informations personnelles</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-capitune-text">Nom:</span> {dossier.data.nom || 'N/A'}</div>
                <div><span className="text-capitune-text">Prénom:</span> {dossier.data.prenom || 'N/A'}</div>
                <div><span className="text-capitune-text">Date de naissance:</span> {dossier.data.date_naissance || 'N/A'}</div>
                <div><span className="text-capitune-text">Nationalité:</span> {dossier.data.nationalite || 'N/A'}</div>
                <div><span className="text-capitune-text">Situation familiale:</span> {dossier.data.situation_familiale || 'N/A'}</div>
                <div><span className="text-capitune-text">Niveau d'études:</span> {dossier.data.niveau_etudes || 'N/A'}</div>
              </div>

              <h3 className="text-lg font-semibold">Profession</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-capitune-text">Métier:</span> {metierLabel[dossier.data.metier] || dossier.data.metier || 'N/A'}</div>
                <div><span className="text-capitune-text">Années d'expérience:</span> {dossier.data.annees_experience || 'N/A'}</div>
                <div><span className="text-capitune-text">Domaine d'études:</span> {domaineEtudesLabel[dossier.data.domaine_etudes] || dossier.data.domaine_etudes || 'N/A'}</div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Motivation</h3>
                <p className="text-capitune-text">{dossier.data.motivation || 'N/A'}</p>
              </div>
            </div>
          )}

          {dossier.file_url && (
            <div>
              <h3 className="text-lg font-semibold mb-2">CV</h3>
              <a
                href={dossier.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
              >
                <Download size={18} />
                Voir le CV
              </a>
            </div>
          )}

          {dossier.refusal_reason && (
            <div className="p-4 bg-red-900/20 rounded">
              <h3 className="text-lg font-semibold mb-2 text-red-300">Motif de refus</h3>
              <p>{dossier.refusal_reason}</p>
            </div>
          )}

          {dbUser?.role === 'conseiller' && dossier.statut === 'envoye' && (
            <div className="flex gap-3">
              <button
                onClick={() => handleAccept(dossier.id)}
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                <Check size={18} />
                Accepter
              </button>
              <button
                onClick={() => setRefusalReason(refusalReason ? '' : dossier.id)}
                disabled={loading}
                className="btn-outline border-red-500 text-red-500 hover:bg-red-900/20 flex items-center gap-2"
              >
                <X size={18} />
                Refuser
              </button>
            </div>
          )}

          {refusalReason && (
            <div className="space-y-3">
              <textarea
                value={refusalReason === dossier.id ? '' : refusalReason}
                onChange={(e) => setRefusalReason(e.target.value)}
                placeholder="Expliquez le motif du refus..."
                className="input-dark w-full"
                rows={4}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleReject(dossier.id)}
                  disabled={loading || !refusalReason}
                  className="btn-primary bg-red-600 hover:bg-red-700"
                >
                  Confirmer le Refus
                </button>
                <button
                  onClick={() => setRefusalReason('')}
                  className="btn-outline"
                >
                  Annuler
                </button>
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
