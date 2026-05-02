import { useAuth } from '../context/AuthContext.jsx';

export default function Profile() {
  const { dbUser, logout } = useAuth();

  return (
    <div className="space-y-6 max-w-md">
      <h2 className="text-2xl font-bold">Profil</h2>
      <div className="card-dark space-y-4">
        <div>
          <label className="text-xs text-capitune-text uppercase">Nom</label>
          <p className="text-lg font-medium">{dbUser?.display_name}</p>
        </div>
        <div>
          <label className="text-xs text-capitune-text uppercase">Email</label>
          <p className="text-lg font-medium">{dbUser?.email}</p>
        </div>
        <div>
          <label className="text-xs text-capitune-text uppercase">Rôle</label>
          <p className="text-lg font-medium capitalize">{dbUser?.role}</p>
        </div>
        <button onClick={logout} className="btn-outline w-full">Se déconnecter</button>
      </div>
    </div>
  );
}
