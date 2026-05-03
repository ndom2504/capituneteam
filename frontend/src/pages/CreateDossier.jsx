import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { FileText, Send, ArrowLeft, Upload } from 'lucide-react';

export default function CreateDossier() {
  const { dbUser, getToken } = useAuth();
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
  const [dossierId, setDossierId] = useState(null);

  useEffect(() => {
    async function fetchConseillers() {
      try {
        const token = await getToken();
        const res = await fetch('/api/users/conseillers', {
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

      const response = await fetch('/api/dossiers', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        const result = await response.json();
        setDossierId(result.id);
        setMessage('Dossier créé avec succès. Sélectionnez un conseiller pour l\'envoyer.');
      } else {
        setMessage('Erreur lors de la création du dossier');
      }
    } catch (err) {
      setMessage('Erreur de connexion');
    } finally {
      setSaving(false);
    }
  };

  const handleSendDossier = async (e) => {
    e.preventDefault();
    if (!dossierId || !selectedConseiller) {
      setMessage('Veuillez d\'abord créer le dossier et sélectionner un conseiller');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const token = await getToken();
      const response = await fetch(`/api/dossiers/${dossierId}/envoyer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ conseiller_id: selectedConseiller }),
      });

      if (response.ok) {
        setMessage('Dossier envoyé au conseiller avec succès');
        setTimeout(() => {
          window.location.href = '/dossiers';
        }, 2000);
      } else {
        setMessage('Erreur lors de l\'envoi du dossier');
      }
    } catch (err) {
      setMessage('Erreur de connexion');
    } finally {
      setSaving(false);
    }
  };

  const programmeOptions = [
    { value: 'entree_express', label: 'Entrée Express' },
    { value: 'permis_etude', label: 'Permis d\'Études' },
    { value: 'affaires', label: 'Affaires' },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <button onClick={() => window.history.back()} className="btn-outline p-2">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold">Créer un Dossier</h2>
      </div>

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
            disabled={dossierId}
          >
            {programmeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={handleCreateDossier} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-capitune-text uppercase mb-2">Nom</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                className="input-dark w-full"
                disabled={dossierId}
                required
              />
            </div>
            <div>
              <label className="block text-xs text-capitune-text uppercase mb-2">Prénom</label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleInputChange}
                className="input-dark w-full"
                disabled={dossierId}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-capitune-text uppercase mb-2">Date de naissance</label>
            <input
              type="date"
              name="date_naissance"
              value={formData.date_naissance}
              onChange={handleInputChange}
              className="input-dark w-full"
              disabled={dossierId}
              required
            />
          </div>

          <div>
            <label className="block text-xs text-capitune-text uppercase mb-2">Nationalité</label>
            <input
              type="text"
              name="nationalite"
              value={formData.nationalite}
              onChange={handleInputChange}
              className="input-dark w-full"
              disabled={dossierId}
              required
            />
          </div>

          <div>
            <label className="block text-xs text-capitune-text uppercase mb-2">Situation familiale</label>
            <select
              name="situation_familiale"
              value={formData.situation_familiale}
              onChange={handleInputChange}
              className="input-dark w-full"
              disabled={dossierId}
              required
            >
              <option value="">Sélectionner</option>
              <option value="celibataire">Célibataire</option>
              <option value="marie">Marié(e)</option>
              <option value="divorce">Divorcé(e)</option>
              <option value="veuf">Veuf/Veuve</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-capitune-text uppercase mb-2">Niveau d'études</label>
              <input
                type="text"
                name="niveau_etudes"
                value={formData.niveau_etudes}
                onChange={handleInputChange}
                className="input-dark w-full"
                disabled={dossierId}
                required
              />
            </div>
            <div>
              <label className="block text-xs text-capitune-text uppercase mb-2">Domaine d'études</label>
              <select
                name="domaine_etudes"
                value={formData.domaine_etudes}
                onChange={handleInputChange}
                className="input-dark w-full"
                disabled={dossierId}
                required
              >
                <option value="">Sélectionner</option>
                <option value="informatique">Informatique</option>
                <option value="ingenierie">Ingénierie</option>
                <option value="sante">Santé</option>
                <option value="business">Business</option>
                <option value="droit">Droit</option>
                <option value="education">Éducation</option>
                <option value="arts">Arts</option>
                <option value="sciences">Sciences</option>
                <option value="autre">Autre</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-capitune-text uppercase mb-2">Métier</label>
              <select
                name="metier"
                value={formData.metier}
                onChange={handleInputChange}
                className="input-dark w-full"
                disabled={dossierId}
                required
              >
                <option value="">Sélectionner</option>
                <option value="developpeur">Développeur</option>
                <option value="ingenieur">Ingénieur</option>
                <option value="medecin">Médecin</option>
                <option value="infirmier">Infirmier</option>
                <option value="enseignant">Enseignant</option>
                <option value="comptable">Comptable</option>
                <option value="avocat">Avocat</option>
                <option value="gestionnaire">Gestionnaire</option>
                <option value="artisan">Artisan</option>
                <option value="commercial">Commercial</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-capitune-text uppercase mb-2">Années d'expérience</label>
              <input
                type="number"
                name="annees_experience"
                value={formData.annees_experience}
                onChange={handleInputChange}
                className="input-dark w-full"
                disabled={dossierId}
                required
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-capitune-text uppercase mb-2">Motivation</label>
            <textarea
              name="motivation"
              value={formData.motivation}
              onChange={handleInputChange}
              className="input-dark w-full"
              rows={4}
              disabled={dossierId}
              required
            />
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
                  disabled={dossierId}
                />
              </label>
              {file && <span className="text-sm text-capitune-text">{file.name}</span>}
            </div>
          </div>

          {!dossierId && (
            <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
              <FileText size={18} />
              {saving ? 'Création...' : 'Créer le Dossier'}
            </button>
          )}
        </form>

        {dossierId && (
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
                    {conseiller.display_name || conseiller.email}
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
