import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { LayoutDashboard, FolderOpen, Ticket, MessageSquare, User, LogOut, Menu, X, Briefcase, Shield, BookOpen } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { path: '/dossiers', label: 'Dossiers', icon: FolderOpen },
  { path: '/tickets', label: 'Services', icon: Ticket },
  { path: '/messages', label: 'Messages', icon: MessageSquare },
  { path: '/resources', label: 'Ressources', icon: BookOpen },
  { path: '/profile', label: 'Profil', icon: User },
];

const conseillerNavItems = [
  { path: '/conseiller', label: 'Tableau de bord', icon: Briefcase },
  { path: '/tickets', label: 'Paiements', icon: Ticket },
  { path: '/messages', label: 'Messages', icon: MessageSquare },
  { path: '/resources', label: 'Ressources', icon: BookOpen },
  { path: '/profile', label: 'Profil', icon: User },
];

const adminNavItems = [
  { path: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { path: '/admin', label: 'Administration', icon: Shield },
  { path: '/dossiers', label: 'Dossiers', icon: FolderOpen },
  { path: '/tickets', label: 'Services', icon: Ticket },
  { path: '/messages', label: 'Messages', icon: MessageSquare },
  { path: '/resources', label: 'Ressources', icon: BookOpen },
  { path: '/profile', label: 'Profil', icon: User },
];

export default function Layout({ children }) {
  const { dbUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const currentNavItems = dbUser?.role === 'admin' ? adminNavItems : dbUser?.role === 'conseiller' ? conseillerNavItems : navItems;
  const userDisplayName = dbUser?.first_name || dbUser?.last_name
    ? `${dbUser?.first_name || ''} ${dbUser?.last_name || ''}`.trim()
    : dbUser?.display_name || dbUser?.email;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r border-capitune-border bg-capitune-black fixed h-full">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-capitune-white tracking-tight">CAPITUNE</h1>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition font-medium ${
                  active ? 'bg-capitune-gray text-capitune-white' : 'text-capitune-text hover:bg-capitune-gray hover:text-capitune-white'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-capitune-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-capitune-white">{userDisplayName}</p>
              <p className="text-xs text-capitune-text capitalize">{dbUser?.role}</p>
            </div>
            <button onClick={handleLogout} className="text-capitune-text hover:text-capitune-white transition">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-capitune-black border-b border-capitune-border flex items-center justify-between px-4 h-14">
        <h1 className="text-lg font-bold">CAPITUNE</h1>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-capitune-white">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-capitune-black pt-14">
          <nav className="px-4 py-4 space-y-2">
            {currentNavItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    active ? 'bg-capitune-gray text-capitune-white' : 'text-capitune-text hover:bg-capitune-gray'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-capitune-text w-full">
              <LogOut size={20} /> Déconnexion
            </button>
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-64 pt-14 md:pt-0 min-h-screen">
        <div className="max-w-6xl mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
