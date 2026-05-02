import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-capitune-black px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center mb-8 text-capitune-white">CAPITUNE</h1>
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
          <button type="submit" className="btn-primary w-full">
            {isRegister ? 'Créer un compte' : 'Se connecter'}
          </button>
        </form>
        <p className="mt-4 text-center text-capitune-text text-sm">
          {isRegister ? 'Déjà un compte ?' : 'Pas de compte ?'}{' '}
          <button onClick={() => setIsRegister(!isRegister)} className="text-capitune-white underline">
            {isRegister ? 'Se connecter' : 'S\'inscrire'}
          </button>
        </p>
      </div>
    </div>
  );
}
