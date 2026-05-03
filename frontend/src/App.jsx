import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import About from './pages/About.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Dossiers from './pages/Dossiers.jsx';
import DossierDetail from './pages/DossierDetail.jsx';
import CreateDossier from './pages/CreateDossier.jsx';
import Tickets from './pages/Tickets.jsx';
import TicketDetail from './pages/TicketDetail.jsx';
import Messages from './pages/Messages.jsx';
import Profile from './pages/Profile.jsx';
import ConseillerDashboard from './pages/ConseillerDashboard.jsx';

function ProtectedRoute({ children }) {
  const { firebaseUser, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-capitune-black text-capitune-white">Chargement...</div>;
  if (!firebaseUser) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/about" element={<About />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/dossiers" element={<ProtectedRoute><Dossiers /></ProtectedRoute>} />
      <Route path="/dossiers/create" element={<ProtectedRoute><CreateDossier /></ProtectedRoute>} />
      <Route path="/dossiers/:id/edit" element={<ProtectedRoute><CreateDossier /></ProtectedRoute>} />
      <Route path="/dossiers/:id" element={<ProtectedRoute><DossierDetail /></ProtectedRoute>} />
      <Route path="/conseiller" element={<ProtectedRoute><ConseillerDashboard /></ProtectedRoute>} />
      <Route path="/tickets" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
      <Route path="/tickets/:id" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
      <Route path="/messages/:dossierId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
