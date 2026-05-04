import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiFetch } from '../config/api.js';
import { User, Camera, Save } from 'lucide-react';

export default function Profile() {
  const { dbUser, logout, getToken, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    profile_photo_url: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (dbUser) {
      setFormData({
        first_name: dbUser.first_name || '',
        last_name: dbUser.last_name || '',
        profile_photo_url: dbUser.profile_photo_url || '',
      });
    }
  }, [dbUser]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('L\'image est trop grande. Maximum 5MB.');
        return;
      }
      setPhotoFile(file);
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profile_photo_url: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return;
    setSaving(true);
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('photo', photoFile);

      const response = await apiFetch('/api/users/upload-photo', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({ ...formData, profile_photo_url: data.profile_photo_url });
        setMessage('Photo mise à jour avec succès');
      } else {
        setMessage('Erreur lors de l\'upload de la photo');
      }
    } catch (err) {
      setMessage('Erreur de connexion');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      // Upload photo first if changed
      if (photoFile) {
        await handlePhotoUpload();
        if (!message.includes('succès')) {
          setSaving(false);
          return;
        }
      }

      // Update profile without photo URL
      const token = await getToken();
      const response = await apiFetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
        }),
      });

      if (response.ok) {
        await response.json();
        setMessage('Profil mis à jour avec succès');
        setEditing(false);
        setPhotoFile(null);
        await refreshUser();
      } else {
        setMessage('Erreur lors de la mise à jour du profil');
      }
    } catch (err) {
      setMessage('Erreur de connexion');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Profil</h2>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-capitune-white hover:underline"
          >
            Modifier
          </button>
        )}
      </div>

      {message && (
        <div className={`p-3 rounded ${message.includes('succès') ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
          {message}
        </div>
      )}

      <div className="card-dark space-y-6">
        {/* Profile Photo */}
        <div className="flex items-center gap-6">
          <div className="relative">
            {formData.profile_photo_url ? (
              <img
                src={formData.profile_photo_url}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-capitune-white"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-capitune-border flex items-center justify-center">
                <User size={48} className="text-capitune-text" />
              </div>
            )}
            {editing && (
              <label className="absolute bottom-0 right-0 bg-capitune-white rounded-full p-2 cursor-pointer hover:bg-gray-200">
                <Camera size={16} className="text-capitune-black" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <div>
            <p className="text-xl font-semibold">
              {formData.first_name || formData.last_name
                ? `${formData.first_name || ''} ${formData.last_name || ''}`.trim()
                : dbUser?.display_name || 'Utilisateur'}
            </p>
            <p className="text-sm text-capitune-text">{dbUser?.email}</p>
            <span className="inline-block mt-1 px-2 py-1 text-xs rounded-full bg-capitune-white/10 capitalize">
              {dbUser?.role}
            </span>
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-capitune-text uppercase mb-2">Prénom</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="input-dark w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-capitune-text uppercase mb-2">Nom</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="input-dark w-full"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                <Save size={18} />
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="btn-outline"
              >
                Annuler
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-capitune-text uppercase">Prénom</label>
              <p className="text-lg font-medium">{formData.first_name || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-capitune-text uppercase">Nom</label>
              <p className="text-lg font-medium">{formData.last_name || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-capitune-text uppercase">Email</label>
              <p className="text-lg font-medium">{dbUser?.email}</p>
            </div>
            <div>
              <label className="text-xs text-capitune-text uppercase">Rôle</label>
              <p className="text-lg font-medium capitalize">{dbUser?.role}</p>
            </div>
            <button onClick={logout} className="btn-outline w-full mt-6">Se déconnecter</button>
          </div>
        )}
      </div>
    </div>
  );
}
