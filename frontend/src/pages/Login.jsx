import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Globe, Shield, Users, TrendingUp, Heart, Rocket, ChevronRight } from 'lucide-react';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        await register(email, password, displayName, 'client');
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  const values = [
    { icon: Users, title: 'Accompagnement humain', desc: 'Chaque membre est écouté, compris et accompagné dans son aventure canadienne.' },
    { icon: Shield, title: 'Transparence et confiance', desc: 'Des processus clairs, des informations fiables et une communication honnête.' },
    { icon: TrendingUp, title: 'Excellence et professionnalisme', desc: 'Des conseillers engagés à offrir des services de qualité adaptés à chaque profil.' },
    { icon: Heart, title: 'Inclusion et diversité', desc: 'Toutes les origines et cultures sont valorisées comme une richesse pour le Canada.' },
    { icon: Rocket, title: 'Ambition collective', desc: 'La réussite individuelle nourrit une communauté forte, inspirante et solidaire.' },
  ];

  return (
    <div className="min-h-screen bg-capitune-black text-capitune-white flex">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 border-r border-capitune-border">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-8 h-8" />
            <h1 className="text-4xl font-bold tracking-tight">CAPITUNE</h1>
          </div>
          <p className="text-xl text-capitune-text mb-2">Votre passerelle vers l'expérience canadienne</p>
          <p className="text-lg font-medium mb-8">Construisons ensemble votre avenir au Canada</p>

          <div className="space-y-6 mb-8">
            <p className="text-capitune-text leading-relaxed">
              CAPITUNE est une plateforme dédiée à celles et ceux qui souhaitent vivre, étudier,
              travailler ou entreprendre au Canada. Votre projet prend forme, accompagné par des
              conseillers, une communauté engagée et une vision commune : faire du rêve canadien
              une réalité concrète et partagée.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm uppercase tracking-wider text-capitune-text font-semibold">Nos valeurs</h3>
            {values.map((v, i) => (
              <div key={i} className="flex items-start gap-3 group">
                <v.icon className="w-5 h-5 mt-0.5 text-capitune-text group-hover:text-capitune-white transition" />
                <div>
                  <p className="font-medium text-sm">{v.title}</p>
                  <p className="text-xs text-capitune-text">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="border-t border-capitune-border pt-4">
            <p className="text-sm text-capitune-text mb-2">Un projet de</p>
            <p className="font-semibold">Export Monde Prestige inc.</p>
            <p className="text-xs text-capitune-text">Fondée en 2023 à Sherbrooke, Québec</p>
          </div>
          <p className="text-capitune-text text-sm italic">
            "Bâtir une communauté engagée, solidaire et ambitieuse, unie par la volonté de réaliser
            le rêve canadien et de le partager avec d'autres."
          </p>
        </div>
      </div>

      {/* Right panel - Auth form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">CAPITUNE</h1>
            <p className="text-capitune-text">Votre passerelle vers l'expérience canadienne</p>
          </div>

          <h2 className="text-2xl font-bold mb-2">
            {isRegister ? 'Rejoindre CAPITUNE' : 'Bienvenue sur CAPITUNE'}
          </h2>
          <p className="text-capitune-text mb-8 text-sm">
            {isRegister
              ? 'Créez votre compte et commencez votre aventure canadienne.'
              : 'Connectez-vous pour accéder à votre espace personnel.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <input
                type="text"
                placeholder="Nom complet"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input-dark w-full"
                required
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-dark w-full"
              required
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-dark w-full"
              required
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
              {isRegister ? 'Créer un compte' : 'Se connecter'}
              <ChevronRight size={18} />
            </button>
          </form>

          <p className="mt-6 text-center text-capitune-text text-sm">
            {isRegister ? 'Déjà un compte ?' : 'Pas de compte ?'}{' '}
            <button onClick={() => setIsRegister(!isRegister)} className="text-capitune-white font-semibold hover:underline">
              {isRegister ? 'Se connecter' : 'S\'inscrire'}
            </button>
          </p>

          <div className="mt-8 pt-6 border-t border-capitune-border">
            <p className="text-xs text-capitune-text text-center flex items-center justify-center gap-2">
              <Shield size={12} />
              Vos informations sont protégées. Une seule plateforme, plusieurs opportunités, un accompagnement sécurisé.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
