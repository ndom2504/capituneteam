import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiFetch } from '../config/api.js';
import { Link } from 'react-router-dom';
import { Plus, ArrowRight } from 'lucide-react';

export default function Tickets() {
  const { dbUser, getToken } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [dossiers, setDossiers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    dossier_id: '',
    service_name: '',
    description: '',
    scope: '',
    conditions: '',
    price: '',
    deadline: ''
  });

  const serviceTemplates = {
    'Analyse d’éligibilité Entrée Express': {
      description: [
        'Analyse complète du profil Entrée Express avec estimation des points et recommandations.',
        'Évaluation de l’admissibilité aux programmes fédéraux et provinciaux liés à Entrée Express.',
        'Diagnostic du profil et identification des leviers d’amélioration avant création ou mise à jour du profil.'
      ],
      scope: [
        'Analyse âge, études, expérience, langues, offre d’emploi et facteurs d’adaptabilité.',
        'Vérification des critères FSW, CEC, FST et pistes provinciales pertinentes.',
        'Identification des documents et actions nécessaires pour optimiser le score.'
      ],
      conditions: [
        'Livrable : rapport synthèse avec score estimatif, forces, faiblesses et recommandations.',
        'Le client doit fournir CV, diplômes, tests linguistiques disponibles et historique professionnel.',
        'Les frais gouvernementaux, EDE et tests linguistiques ne sont pas inclus.'
      ]
    },
    'Préparation dossier permis d’étude': {
      description: [
        'Préparation structurée du dossier de permis d’études selon le profil académique et financier.',
        'Accompagnement dans l’organisation des preuves scolaires, financières et du projet d’études.',
        'Révision stratégique du dossier avant dépôt de la demande de permis d’études.'
      ],
      scope: [
        'Analyse du projet d’études, cohérence du parcours et capacité financière.',
        'Liste personnalisée des documents requis et vérification de leur conformité.',
        'Structuration des éléments justificatifs pour renforcer la demande.'
      ],
      conditions: [
        'Livrable : checklist personnalisée, recommandations et structure du dossier.',
        'Le client doit fournir lettre d’admission, preuves financières et documents académiques.',
        'Les frais d’admission, biométrie ou gouvernementaux ne sont pas inclus.'
      ]
    },
    'Accompagnement opportunité d’affaires': {
      description: [
        'Accompagnement pour identifier des opportunités d’affaires adaptées au profil entrepreneurial.',
        'Analyse du projet, du marché visé et des options d’implantation possibles.',
        'Orientation stratégique pour développer une démarche d’affaires crédible.'
      ],
      scope: [
        'Analyse du profil entrepreneur, secteur d’activité, budget et objectifs.',
        'Recherche de pistes d’opportunités et recommandations de positionnement.',
        'Préparation des prochaines étapes pour valider le projet.'
      ],
      conditions: [
        'Livrable : note d’orientation avec pistes d’opportunités et actions recommandées.',
        'Le client doit fournir expérience, budget estimé, secteur visé et objectifs.',
        'La validation finale des opportunités dépend des tiers et marchés concernés.'
      ]
    },
    'Consultation personnalisée': {
      description: [
        'Consultation personnalisée pour clarifier la stratégie selon la situation du client.',
        'Séance d’orientation pour répondre aux questions prioritaires du client.',
        'Analyse courte du dossier et recommandations pratiques.'
      ],
      scope: [
        'Discussion sur les objectifs, contraintes, options disponibles et risques.',
        'Réponse aux questions prioritaires et orientation vers les prochaines étapes.',
        'Résumé des recommandations principales après la consultation.'
      ],
      conditions: [
        'Livrable : résumé ou plan d’action simplifié après consultation.',
        'Le client doit transmettre ses questions et documents utiles avant la séance.',
        'Cette consultation ne remplace pas un mandat complet de préparation de dossier.'
      ]
    },
    'Montage de dossier complet': {
      description: [
        'Montage complet du dossier selon le programme choisi et les exigences applicables.',
        'Organisation, vérification et structuration complète des pièces du dossier.',
        'Accompagnement global jusqu’à la préparation du dossier prêt au dépôt.'
      ],
      scope: [
        'Analyse des documents, checklist complète, structuration et suivi des pièces manquantes.',
        'Révision des formulaires, preuves justificatives et cohérence globale du dossier.',
        'Préparation finale du dossier selon les informations fournies par le client.'
      ],
      conditions: [
        'Livrable : dossier structuré avec checklist et recommandations finales.',
        'Le délai commence après réception complète des documents demandés.',
        'Les frais gouvernementaux, traductions, évaluations ou frais externes ne sont pas inclus.'
      ]
    },
    'Bâtir un profil professionnel': {
      description: [
        'Création ou optimisation du profil professionnel pour renforcer le projet du client.',
        'Structuration du CV, expériences et éléments de valeur professionnelle.',
        'Mise en valeur du parcours pour appuyer un projet d’immigration, d’études ou d’affaires.'
      ],
      scope: [
        'Analyse du parcours, expériences, compétences, réalisations et objectifs.',
        'Recommandations pour CV, profil professionnel et positionnement.',
        'Structuration des informations pour usage dans le dossier.'
      ],
      conditions: [
        'Livrable : profil professionnel structuré et recommandations d’amélioration.',
        'Le client doit fournir CV actuel, expériences, diplômes et objectifs.',
        'La rédaction finale peut nécessiter des échanges complémentaires.'
      ]
    },
    'Recherche d’opportunité d’affaires': {
      description: [
        'Recherche ciblée d’opportunités d’affaires selon le secteur et la capacité d’investissement.',
        'Identification de pistes commerciales ou entrepreneuriales adaptées au profil.',
        'Analyse préliminaire des options d’affaires disponibles.'
      ],
      scope: [
        'Définition des critères de recherche, secteur, budget et région visée.',
        'Sélection de pistes pertinentes et analyse de faisabilité initiale.',
        'Recommandations pour contacter, valider ou approfondir les opportunités.'
      ],
      conditions: [
        'Livrable : liste structurée de pistes avec observations et recommandations.',
        'Les résultats dépendent des informations disponibles et du marché.',
        'Les frais de tiers, due diligence et transactions ne sont pas inclus.'
      ]
    },
    'Recherche d’établissement et procédure d’admission': {
      description: [
        'Recherche d’établissements et programmes d’études adaptés au profil du client.',
        'Accompagnement dans la sélection des programmes et la procédure d’admission.',
        'Préparation des étapes nécessaires pour obtenir une admission scolaire.'
      ],
      scope: [
        'Analyse du parcours académique, budget, province souhaitée et objectifs.',
        'Sélection de programmes compatibles et identification des prérequis.',
        'Orientation sur les documents d’admission et échéanciers.'
      ],
      conditions: [
        'Livrable : liste d’options d’études et procédure recommandée.',
        'Les frais d’admission ou frais scolaires ne sont pas inclus.',
        'L’acceptation finale dépend exclusivement des établissements.'
      ]
    },
    'Préparation du plan d’affaires': {
      description: [
        'Préparation ou structuration d’un plan d’affaires pour appuyer le projet entrepreneurial.',
        'Accompagnement à la rédaction des sections clés du plan d’affaires.',
        'Organisation de la stratégie commerciale, financière et opérationnelle du projet.'
      ],
      scope: [
        'Analyse du concept, marché, clientèle cible, modèle économique et plan d’action.',
        'Structuration des sections principales : offre, marché, opérations, finances.',
        'Recommandations pour rendre le plan cohérent avec le projet visé.'
      ],
      conditions: [
        'Livrable : plan d’affaires structuré ou document de travail avancé.',
        'Le client doit fournir les informations commerciales, financières et opérationnelles.',
        'Les études de marché payantes ou validations externes ne sont pas incluses.'
      ]
    },
    'Optimisation du profil Entrée Express': {
      description: [
        'Optimisation du profil Entrée Express pour améliorer le score et la compétitivité.',
        'Recommandations ciblées pour renforcer les facteurs clés du profil.',
        'Analyse des actions prioritaires pour augmenter les chances d’invitation.'
      ],
      scope: [
        'Analyse du score actuel, langues, études, expérience et options provinciales.',
        'Identification des actions à fort impact sur le score.',
        'Plan d’amélioration priorisé selon faisabilité et délais.'
      ],
      conditions: [
        'Livrable : plan d’optimisation avec priorités et recommandations.',
        'Le client doit fournir ses résultats actuels et documents de profil.',
        'Aucune invitation n’est garantie, les rondes dépendent des autorités compétentes.'
      ]
    },
    'Accompagnement choix de programme d’études': {
      description: [
        'Accompagnement au choix d’un programme d’études cohérent avec le parcours du client.',
        'Analyse de l’adéquation entre projet académique, carrière et immigration.',
        'Orientation vers des options d’études réalistes et pertinentes.'
      ],
      scope: [
        'Analyse du parcours, objectifs, budget, niveau souhaité et province visée.',
        'Comparaison des options de programmes et recommandations.',
        'Orientation sur les critères de cohérence du projet d’études.'
      ],
      conditions: [
        'Livrable : recommandations de programmes et critères de sélection.',
        'Le client doit fournir diplômes, relevés, objectifs et contraintes budgétaires.',
        'Les décisions d’admission relèvent des établissements.'
      ]
    },
    'Accompagnement stratégique en immigration': {
      description: [
        'Accompagnement stratégique pour choisir la meilleure voie selon le profil du client.',
        'Analyse multi-options et priorisation des démarches possibles.',
        'Construction d’un plan d’action réaliste pour le projet d’immigration.'
      ],
      scope: [
        'Analyse du profil personnel, professionnel, académique, linguistique et familial.',
        'Comparaison des options pertinentes et identification des risques.',
        'Plan d’action avec étapes, priorités et documents à préparer.'
      ],
      conditions: [
        'Livrable : stratégie écrite ou plan d’action personnalisé.',
        'Le client doit fournir des informations complètes et exactes.',
        'Les résultats finaux dépendent des critères et décisions des autorités.'
      ]
    },
    'Révision et structuration des documents': {
      description: [
        'Révision des documents du client pour améliorer la cohérence et la présentation du dossier.',
        'Structuration des pièces justificatives selon les exigences du programme.',
        'Vérification des documents avant dépôt ou transmission.'
      ],
      scope: [
        'Révision de la cohérence, lisibilité, classification et complétude des documents.',
        'Identification des pièces manquantes ou faibles.',
        'Recommandations de correction et d’organisation.'
      ],
      conditions: [
        'Livrable : liste de corrections et structure documentaire recommandée.',
        'Le client doit fournir tous les documents dans un format lisible.',
        'Les traductions certifiées, notarisation ou frais externes ne sont pas inclus.'
      ]
    },
    'Suivi personnalisé jusqu’au dépôt': {
      description: [
        'Suivi personnalisé du dossier jusqu’à la préparation au dépôt.',
        'Accompagnement dans les étapes finales, corrections et vérifications.',
        'Support continu pour organiser les actions restantes avant soumission.'
      ],
      scope: [
        'Suivi des pièces, rappels des actions, vérifications finales et coordination.',
        'Réponses aux questions liées au dossier en cours.',
        'Préparation des dernières étapes avant dépôt.'
      ],
      conditions: [
        'Livrable : suivi opérationnel et validation des étapes complétées.',
        'Le client doit respecter les délais de transmission des documents.',
        'Les délais externes et décisions finales ne dépendent pas du conseiller.'
      ]
    }
  };

  const serviceTypes = Object.keys(serviceTemplates);
  const selectedTemplate = serviceTemplates[form.service_name];

  const statusLabel = {
    en_attente_paiement: 'En attente de paiement',
    payee: 'Payée',
    en_cours: 'En cours',
    termine: 'Terminée'
  };

  async function fetchTickets() {
    const token = await getToken();
    const res = await apiFetch('/api/tickets', { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setTickets(await res.json());
  }

  async function fetchDossiers() {
    const token = await getToken();
    const endpoint = dbUser?.role === 'conseiller' ? '/api/dossiers/conseiller/dossiers/all' : '/api/dossiers';
    const res = await apiFetch(endpoint, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setDossiers(await res.json());
  }

  function handleServiceChange(serviceName) {
    const template = serviceTemplates[serviceName];
    setForm({
      ...form,
      service_name: serviceName,
      description: template?.description?.[0] || '',
      scope: template?.scope?.[0] || '',
      conditions: template?.conditions?.[0] || ''
    });
  }

  useEffect(() => {
    if (dbUser) { fetchTickets(); fetchDossiers(); }
  }, [dbUser]);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    const token = await getToken();
    const res = await apiFetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, price: parseFloat(form.price) }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Erreur lors de la création de la requête');
      return;
    }
    setShowForm(false);
    setForm({ dossier_id: '', service_name: '', description: '', scope: '', conditions: '', price: '', deadline: '' });
    fetchTickets();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{dbUser?.role === 'conseiller' ? 'Paiements & Services' : 'Services à payer'}</h2>
        {dbUser?.role === 'conseiller' && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Créer une requête
          </button>
        )}
      </div>
      {showForm && (
        <form onSubmit={handleCreate} className="card-dark space-y-3">
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <select value={form.dossier_id} onChange={e => setForm({ ...form, dossier_id: e.target.value })} className="input-dark w-full" required>
            <option value="">Choisir un dossier accepté</option>
            {dossiers.filter(d => d.statut === 'accepte').map(d => (
              <option key={d.id} value={d.id}>Dossier #{d.id} - {d.programme}</option>
            ))}
          </select>
          <select value={form.service_name} onChange={e => handleServiceChange(e.target.value)} className="input-dark w-full" required>
            <option value="">Type de service</option>
            {serviceTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
          {selectedTemplate && (
            <div className="text-xs text-capitune-text">
              Les champs ci-dessous sont préremplis selon le type de service. Vous pouvez les ajuster avant l’envoi.
            </div>
          )}
          {selectedTemplate && (
            <select value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-dark w-full">
              <option value="">Description du service - choisir un modèle</option>
              {selectedTemplate.description.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          )}
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description claire du service" className="input-dark w-full min-h-24" required />
          {selectedTemplate && (
            <select value={form.scope} onChange={e => setForm({ ...form, scope: e.target.value })} className="input-dark w-full">
              <option value="">Périmètre de l’intervention - choisir un modèle</option>
              {selectedTemplate.scope.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          )}
          <textarea value={form.scope} onChange={e => setForm({ ...form, scope: e.target.value })} placeholder="Périmètre de l’intervention" className="input-dark w-full min-h-20" />
          {selectedTemplate && (
            <select value={form.conditions} onChange={e => setForm({ ...form, conditions: e.target.value })} className="input-dark w-full">
              <option value="">Conditions et livrables - choisir un modèle</option>
              {selectedTemplate.conditions.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          )}
          <textarea value={form.conditions} onChange={e => setForm({ ...form, conditions: e.target.value })} placeholder="Conditions et livrables" className="input-dark w-full min-h-20" />
          <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="Prix (CAD)" className="input-dark w-full" required />
          <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="input-dark w-full" required />
          <button type="submit" className="btn-primary">Créer la requête</button>
        </form>
      )}
      <div className="space-y-3">
        {tickets.map(t => (
          <Link key={t.id} to={`/tickets/${t.id}`} className="card-dark flex items-center justify-between hover:border-capitune-white transition">
            <div>
              <p className="font-semibold">{t.service_name}</p>
              <p className="text-sm text-capitune-text">
                Dossier #{t.dossier_id} • {t.client_name || 'Client'} • {statusLabel[t.status] || t.status} • {t.price} $CAD
              </p>
            </div>
            <ArrowRight size={18} className="text-capitune-text" />
          </Link>
        ))}
        {tickets.length === 0 && <p className="text-capitune-text">Aucun ticket.</p>}
      </div>
    </div>
  );
}
