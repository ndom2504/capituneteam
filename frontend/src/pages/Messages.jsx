import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Send, Paperclip, FileText, Download } from 'lucide-react';

function FileAttachment({ url, isMine }) {
  if (!url) return null;
  // Old base64 format - can't open
  if (url.startsWith('data:')) {
    return <p className="text-xs italic opacity-60 mt-1">📎 Fichier (ancien format, non disponible)</p>;
  }
  const isPdf = url.includes('.pdf') || (url.includes('cloudinary') && url.includes('/image/upload/'));
  const isImage = /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url);
  const fileName = url.split('/').pop().split('?')[0] || 'Fichier';

  if (isImage) {
    return (
      <a href={url} target="_blank" rel="noreferrer">
        <img src={url} alt="Image" className="w-full max-h-48 object-cover rounded mt-2 cursor-pointer" />
      </a>
    );
  }

  if (isPdf && url.includes('cloudinary')) {
    const previewUrl = url.replace('/upload/', '/upload/f_jpg,q_auto,w_400,h_500,c_pad/');
    return (
      <div className="mt-2 space-y-1">
        <img
          src={previewUrl}
          alt="Aperçu PDF"
          className="w-full h-40 object-cover rounded cursor-pointer border border-white/10"
          onClick={() => window.open(url, '_blank')}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <a href={url} target="_blank" rel="noreferrer" download
          className={`inline-flex items-center gap-1 text-xs underline ${isMine ? 'text-blue-600' : 'text-blue-300'}`}>
          <Download size={12} /> Télécharger le PDF
        </a>
      </div>
    );
  }

  return (
    <a href={url} target="_blank" rel="noreferrer" download
      className={`inline-flex items-center gap-1 text-xs underline mt-1 ${isMine ? 'text-blue-600' : 'text-blue-300'}`}>
      <Download size={12} /> {fileName}
    </a>
  );
}

export default function Messages() {
  const { dossierId } = useParams();
  const { dbUser, getToken } = useAuth();
  const [dossiers, setDossiers] = useState([]);
  const [selected, setSelected] = useState(dossierId ? parseInt(dossierId) : null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);

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

  async function fetchDossiers() {
    const token = await getToken();
    // For conseiller, fetch assigned dossiers; for client, fetch own dossiers
    const endpoint = dbUser?.role === 'conseiller' ? '/api/dossiers/conseiller/dossiers/all' : '/api/dossiers';
    const res = await fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setDossiers(await res.json());
  }

  async function fetchMessages(id) {
    const token = await getToken();
    const res = await fetch(`/api/messages/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setMessages(await res.json());
  }

  useEffect(() => { if (dbUser) fetchDossiers(); }, [dbUser]);

  // Refresh dossiers list when tab changes or after sending a message
  useEffect(() => {
    if (!selected && dbUser) fetchDossiers();
  }, [selected, dbUser]);
  useEffect(() => { if (selected) fetchMessages(selected); }, [selected]);

  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  async function handleSend(e) {
    e.preventDefault();
    if (!selected) return;
    if (!text.trim() && !file) return;
    setSending(true);
    setSendError('');
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('content', text);
      if (file) formData.append('file', file);
      const res = await fetch(`/api/messages/${selected}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur lors de l\'envoi');
      }
      setText('');
      setFile(null);
      fetchMessages(selected);
    } catch (err) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-4 h-[calc(100vh-8rem)] flex flex-col">
      <h2 className="text-2xl font-bold">Messagerie</h2>
      {!selected ? (
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-capitune-white mb-2">Sélectionner un dossier :</label>
          <div className="space-y-2">
            {dossiers.map(d => (
              <button key={d.id} onClick={() => setSelected(d.id)} className="card-dark w-full text-left hover:border-blue-500 transition-all p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={16} className="text-blue-400" />
                  <span className="font-semibold text-capitune-white">Dossier #{d.id}</span>
                </div>
                <p className="text-sm text-capitune-white">{programmeLabel[d.programme] || d.programme}</p>
                <p className="text-xs text-capitune-text mt-1">{statutLabel[d.statut] || d.statut}</p>
              </button>
            ))}
            {dossiers.length === 0 && <p className="text-capitune-text text-center py-4">Aucun dossier disponible.</p>}
          </div>
        </div>
      ) : (
        <>
          <button onClick={() => setSelected(null)} className="text-capitune-text hover:text-capitune-white text-sm w-fit flex items-center gap-1">
            ← Changer de dossier
          </button>
          <div className="flex-1 overflow-y-auto space-y-3 bg-capitune-dark rounded-xl p-4 border border-capitune-border">
            {messages.map(m => (
              <div key={m.id} className={`max-w-[70%] ${m.sender_id === dbUser?.id ? 'ml-auto' : ''}`}>
                <div className={`rounded-xl px-4 py-2 text-sm ${m.sender_id === dbUser?.id ? 'bg-capitune-white text-capitune-black' : 'bg-capitune-gray text-capitune-white'}`}>
                  <p className="text-xs opacity-70 mb-1">{m.sender_name}</p>
                  {m.content && <p>{m.content}</p>}
                  <FileAttachment url={m.file_url} isMine={m.sender_id === dbUser?.id} />
                </div>
                <p className="text-[10px] text-capitune-text mt-1">{new Date(m.created_at).toLocaleString('fr-CA')}</p>
              </div>
            ))}
            {messages.length === 0 && <p className="text-capitune-text text-center">Aucun message.</p>}
          </div>
          {sendError && <p className="text-red-400 text-xs">{sendError}</p>}
          {file && <p className="text-capitune-text text-xs">📎 {file.name}</p>}
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <label className="btn-outline cursor-pointer">
              <Paperclip size={18} />
              <input type="file" className="hidden" onChange={e => setFile(e.target.files[0])} />
            </label>
            <input value={text} onChange={e => setText(e.target.value)} placeholder="Écrire un message..." className="input-dark flex-1" disabled={sending} />
            <button type="submit" className="btn-primary" disabled={sending || (!text.trim() && !file)}>
              {sending ? '...' : <Send size={18} />}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
