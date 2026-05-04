import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiFetch } from '../config/api.js';
import { useNavigate, useParams } from 'react-router-dom';
import { FileText, Send, ArrowLeft, Upload } from 'lucide-react';

export default function CreateDossier() {
  const { dbUser, getToken } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const [programme, setProgramme] = useState('entree_express');
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    date_naissance: '',
    nationalite: '',
    situation_familiale: '',
    niveau_etudes: '',
    domaine_etudes: '',
    metier: '',
    annees_experience: '',
    motivation: '',
  });
  const [file, setFile] = useState(null);
  const [conseillers, setConseillers] = useState([]);
  const [selectedConseiller, setSelectedConseiller] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [newDossierId, setNewDossierId] = useState(null);

  useEffect(() => {
    async function fetchConseillers() {
      try {
        const token = await getToken();
        const res = await apiFetch('/api/users/conseillers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          console.log('Conseillers fetched:', data);
          setConseillers(data);
        } else {
          console.error('Failed to fetch conseillers:', res.status);
        }
      } catch (err) {
        console.error('Error fetching conseillers:', err);
      }
    }
    fetchConseillers();
  }, [getToken]);

  useEffect(() => {
    async function fetchDossier() {
      if (!isEditing) return;
      setLoading(true);
      try {
        const token = await getToken();
        const res = await apiFetch(`/api/dossiers/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const dossier = await res.json();
          setProgramme(dossier.programme);
          setFormData(dossier.data);
          setSelectedConseiller(dossier.conseiller_id || '');
        }
      } catch (err) {
        setMessage('Erreur lors du chargement du dossier');
      } finally {
        setLoading(false);
      }
    }
    fetchDossier();
  }, [isEditing, id, getToken]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setMessage('Le fichier est trop grand. Maximum 5MB.');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleCreateDossier = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const token = await getToken();
      const formDataToSend = new FormData();
      formDataToSend.append('programme', programme);
      formDataToSend.append('data', JSON.stringify(formData));
      if (file) {
        formDataToSend.append('file', file);
      }

      const url = isEditing ? `/api/dossiers/${id}` : '/api/dossiers';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await apiFetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        const result = await response.json();
        if (isEditing) {
          setMessage('Dossier mis à jour avec succès');
        } else {
          setNewDossierId(result.id);
          setMessage('Dossier créé avec succès. Sélectionnez un conseiller pour l\'envoyer.');
        }
      } else {
        setMessage(isEditing ? 'Erreur lors de la mise à jour du dossier' : 'Erreur lors de la création du dossier');
      }
    } catch (err) {
      setMessage('Erreur de connexion');
    } finally {
      setSaving(false);
    }
  };

  const handleSendDossier = async (e) => {
    e.preventDefault();
    if (!newDossierId || !selectedConseiller) {
      setMessage('Veuillez d\'abord créer le dossier et sélectionner un conseiller');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const token = await getToken();
      console.log('Sending dossier:', newDossierId, 'to conseiller:', selectedConseiller);
      const response = await apiFetch(`/api/dossiers/${newDossierId}/envoyer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ conseiller_id: selectedConseiller }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Dossier sent result:', result);
        setMessage('Dossier envoyé au conseiller avec succès');
        setTimeout(() => {
          navigate('/dossiers');
        }, 2000);
      } else {
        const error = await response.json();
        console.error('Error sending dossier:', error);
        setMessage('Erreur lors de l\'envoi du dossier');
      }
    } catch (err) {
      console.error('Error sending dossier:', err);
      setMessage('Erreur de connexion');
    } finally {
      setSaving(false);
    }
  };

  const programmeOptions = [
    { value: 'entree_express', label: 'Entrée Express' },
    { value: 'permis_etude', label: 'Permis d\'Études' },
    { value: 'affaires', label: 'Plan d\'affaires' },
  ];

  const commonFields = [
    { name: 'nom', label: 'Nom', type: 'text', required: true },
    { name: 'prenom', label: 'Prénom', type: 'text', required: true },
    { name: 'date_naissance', label: 'Date de naissance', type: 'date', required: true },
    { name: 'nationalite', label: 'Nationalité', type: 'text', required: true },
    {
      name: 'situation_familiale',
      label: 'Situation familiale',
      type: 'select',
      required: true,
      options: [
        ['celibataire', 'Célibataire'],
        ['marie', 'Marié(e)'],
        ['divorce', 'Divorcé(e)'],
        ['veuf', 'Veuf/Veuve'],
      ],
    },
    { name: 'pays_residence', label: 'Pays de résidence actuel', type: 'text', required: true },
    { name: 'telephone', label: 'Téléphone', type: 'text' },
  ];

  const programmeFields = {
    entree_express: [
      { name: 'niveau_etudes', label: 'Niveau d’études le plus élevé', type: 'text', required: true },
      { name: 'domaine_etudes', label: 'Domaine d’études', type: 'text', required: true },
      { name: 'metier', label: 'Profession / métier principal', type: 'text', required: true },
      { name: 'annees_experience', label: 'Années d’expérience qualifiée', type: 'number', required: true },
      { name: 'niveau_francais', label: 'Niveau de français', type: 'select', options: [['debutant', 'Débutant'], ['intermediaire', 'Intermédiaire'], ['avance', 'Avancé'], ['test_officiel', 'Test officiel disponible']] },
      { name: 'niveau_anglais', label: 'Niveau d’anglais', type: 'select', options: [['debutant', 'Débutant'], ['intermediaire', 'Intermédiaire'], ['avance', 'Avancé'], ['test_officiel', 'Test officiel disponible']] },
      { name: 'offre_emploi', label: 'Avez-vous une offre d’emploi au Canada ?', type: 'select', options: [['oui', 'Oui'], ['non', 'Non']] },
      { name: 'motivation', label: 'Objectif d’immigration et résumé du profil', type: 'textarea', required: true },
    ],
    permis_etude: [
      { name: 'niveau_etudes', label: 'Dernier niveau d’études complété', type: 'text', required: true },
      { name: 'domaine_etudes', label: 'Domaine d’études actuel ou souhaité', type: 'text', required: true },
      { name: 'programme_souhaite', label: 'Programme souhaité au Canada', type: 'text', required: true },
      { name: 'niveau_souhaite', label: 'Niveau souhaité', type: 'select', options: [['college', 'Collège'], ['baccalaureat', 'Baccalauréat'], ['maitrise', 'Maîtrise'], ['doctorat', 'Doctorat'], ['formation_professionnelle', 'Formation professionnelle']] },
      { name: 'province_souhaitee', label: 'Province ou ville souhaitée', type: 'text' },
      { name: 'budget_etudes', label: 'Budget estimé pour les études', type: 'text' },
      { name: 'garant_financier', label: 'Garant financier disponible ?', type: 'select', options: [['oui', 'Oui'], ['non', 'Non'], ['a_confirmer', 'À confirmer']] },
      { name: 'motivation', label: 'Motivation pour le projet d’études', type: 'textarea', required: true },
    ],
    affaires: [
      { name: 'secteur_activite', label: 'Secteur d’activité du projet', type: 'text', required: true },
      { name: 'experience_affaires', label: 'Expérience en affaires / gestion', type: 'textarea', required: true },
      { name: 'description_projet', label: 'Description du projet d’affaires', type: 'textarea', required: true },
      { name: 'montant_investissement', label: 'Montant d’investissement prévu', type: 'text', required: true },
      { name: 'province_implantation', label: 'Province ou marché visé', type: 'text' },
      { name: 'etat_plan_affaires', label: 'État du plan d’affaires', type: 'select', options: [['idee', 'Idée initiale'], ['brouillon', 'Brouillon existant'], ['avance', 'Plan avancé'], ['aucun', 'Aucun document']] },
      { name: 'besoin_accompagnement', label: 'Besoin principal d’accompagnement', type: 'select', options: [['profil_professionnel', 'Bâtir un profil professionnel'], ['opportunites', 'Recherche d’opportunités d’affaires'], ['plan_affaires', 'Préparation du plan d’affaires'], ['strategie', 'Stratégie complète']] },
      { name: 'motivation', label: 'Objectifs et attentes', type: 'textarea', required: true },
    ],
  };

  const renderField = (field) => {
    if (field.type === 'select') {
      return (
        <select name={field.name} value={formData[field.name] || ''} onChange={handleInputChange} className="input-dark w-full" disabled={loading} required={field.required}>
          <option value="">Sélectionner</option>
          {field.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      );
    }
    if (field.type === 'textarea') {
      return (
        <textarea name={field.name} value={formData[field.name] || ''} onChange={handleInputChange} className="input-dark w-full" rows={4} disabled={loading} required={field.required} />
      );
    }
    return (
      <input type={field.type} name={field.name} value={formData[field.name] || ''} onChange={handleInputChange} className="input-dark w-full" disabled={loading} required={field.required} min={field.type === 'number' ? '0' : undefined} />
    );
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/dossiers')} className="btn-outline p-2">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold">{isEditing ? 'Modifier le Dossier' : 'Créer un Dossier'}</h2>
      </div>

      {loading && (
        <div className="card-dark text-center py-8">
          <p className="text-capitune-text">Chargement...</p>
        </div>
      )}

      {message && (
        <div className={`p-3 rounded ${message.includes('succès') ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
          {message}
        </div>
      )}

      <div className="card-dark space-y-6">
        <div>
          <label className="block text-xs text-capitune-text uppercase mb-2">Programme d'immigration</label>
          <select
            value={programme}
            onChange={(e) => setProgramme(e.target.value)}
            className="input-dark w-full"
            disabled={loading}
          >
            {programmeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={handleCreateDossier} className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Informations personnelles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {commonFields.map((field) => (
                <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                  <label className="block text-xs text-capitune-text uppercase mb-2">{field.label}</label>
                  {renderField(field)}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">
              Détails du projet - {programmeOptions.find(option => option.value === programme)?.label}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(programmeFields[programme] || []).map((field) => (
                <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                  <label className="block text-xs text-capitune-text uppercase mb-2">{field.label}</label>
                  {renderField(field)}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-capitune-text uppercase mb-2">CV (PDF, Image)</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 btn-outline cursor-pointer">
                <Upload size={18} />
                <span>Choisir un fichier</span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {file && <span className="text-sm text-capitune-text">{file.name}</span>}
            </div>
          </div>

          <button type="submit" disabled={saving || loading} className="btn-primary w-full flex items-center justify-center gap-2">
            <FileText size={18} />
            {saving ? (isEditing ? 'Mise à jour...' : 'Création...') : (isEditing ? 'Mettre à jour le Dossier' : 'Créer le Dossier')}
          </button>
        </form>

        {!isEditing && newDossierId && (
          <div className="border-t border-capitune-border pt-4 space-y-4">
            <div>
              <label className="block text-xs text-capitune-text uppercase mb-2">Sélectionner un conseiller</label>
              <select
                value={selectedConseiller}
                onChange={(e) => setSelectedConseiller(e.target.value)}
                className="input-dark w-full"
              >
                <option value="">Sélectionner un conseiller</option>
                {conseillers.map((conseiller) => (
                  <option key={conseiller.id} value={conseiller.id}>
                    {conseiller.first_name || conseiller.last_name
                      ? `${conseiller.first_name || ''} ${conseiller.last_name || ''}`.trim()
                      : conseiller.display_name || conseiller.email}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSendDossier}
              disabled={saving || !selectedConseiller}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Send size={18} />
              {saving ? 'Envoi...' : 'Envoyer au Conseiller'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
