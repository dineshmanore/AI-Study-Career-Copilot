import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard',  icon: 'dashboard',      label: 'Dashboard' },
  { to: '/tasks',       icon: 'assignment',    label: 'Tasks' },
  { to: '/study-plan',  icon: 'menu_book',     label: 'Study Plan' },
  { to: '/notes',       icon: 'sticky_note_2', label: 'Notes' },
  { to: '/ask',         icon: 'smart_toy',     label: 'Ask AI' },
  { to: '/resume',      icon: 'description',   label: 'Resume' },
  { to: '/interview',   icon: 'video_chat',    label: 'Interview' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-white/15 text-white shadow-sm'
        : 'text-slate-300 hover:text-white hover:bg-white/8'
    }`;

  const avatarInitial = user?.name?.[0]?.toUpperCase() || '?';

  return (
    <div className="flex h-screen overflow-hidden bg-surface-container-low">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── Sidebar ─────────────────────────────────────────────────── */}
      <aside
        className={`fixed md:static z-50 top-0 left-0 h-full w-[240px] bg-[#1E3A5F] flex flex-col shadow-2xl transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand */}
        <div className="px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-1">
            <img 
              src="/logo.png" 
              alt="Scholarly Edge Logo" 
              className="w-12 h-12 drop-shadow-2xl transition-transform hover:scale-110 duration-500"
            />
            <h1 className="text-xl font-bold text-white font-headline tracking-tight leading-tight">
              Scholarly Edge
            </h1>
          </div>
          <p className="text-slate-400 text-[10px] uppercase tracking-widest pl-[3.25rem]">
            AI Study &amp; Career Copilot
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={linkClasses}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="material-symbols-outlined text-[1.2rem]">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Upgrade CTA */}
        <div className="px-4 py-3">
          <button className="w-full py-2.5 bg-gradient-to-r from-primary to-primary-container text-white font-semibold rounded-xl text-xs hover:opacity-90 transition-opacity shadow-lg">
            ✦ Upgrade to Pro
          </button>
        </div>

        {/* Footer: Settings + User */}
        <div className="border-t border-white/10 px-3 py-3 space-y-0.5">
          <NavLink
            to="/settings"
            className="text-slate-400 hover:text-white hover:bg-white/5 transition-colors duration-200 px-4 py-2 flex items-center gap-3 rounded-xl text-sm"
          >
            <span className="material-symbols-outlined text-[1.1rem]">settings</span>
            Settings
          </NavLink>
          {/* User row */}
          {user ? (
            <div className="flex items-center gap-3 px-4 py-2 mt-1">
              <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {avatarInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold truncate">{user.name}</p>
                <p className="text-slate-400 text-[10px] truncate">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="text-slate-400 hover:text-red-400 transition-colors"
              >
                <span className="material-symbols-outlined text-[1.1rem]">logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-2 mt-1">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/40 font-bold text-sm flex-shrink-0">
                ?
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold truncate">Guest Scholar</p>
                <Link to="/login" className="text-primary text-[10px] font-bold hover:underline">Sign in to sync</Link>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ─── Main canvas ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Nav */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/50 flex justify-between items-center h-16 px-6 gap-4 flex-shrink-0">
          {/* Mobile menu button */}
          <button
            className="md:hidden text-on-surface-variant"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-xl hidden md:block group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[1.1rem] transition-colors group-hover:text-primary">search</span>
            <input
              className="w-full pl-12 pr-4 py-3 bg-surface-container-low border border-outline-variant/10 rounded-2xl text-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none focus:bg-white focus:shadow-lg focus:shadow-primary/5"
              placeholder="Search tasks, notes, or ask AI..."
              type="text"
            />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <button className="hover:text-primary transition-colors p-1 rounded-lg hover:bg-surface-container">
                <span className="material-symbols-outlined">notifications</span>
              </button>
            </div>
            <div className="h-6 w-px bg-outline-variant/40" />
            <Link
              to="/ask"
              className="hidden sm:flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-semibold text-sm hover:bg-primary/20 transition-all"
            >
              <span className="material-symbols-outlined text-[1rem]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
              Ask AI
            </Link>
            {/* User Access */}
            <Link
              to="/profile"
              className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-surface-container transition-all group border border-transparent hover:border-outline-variant/20 hover:shadow-sm active:scale-95"
              title="Identity & Security"
            >
              <div className="hidden sm:block text-right">
                <p className="text-xs font-black text-on-surface tracking-tight leading-none group-hover:text-primary transition-colors">{user ? user.name.split(' ')[0] : 'Guest'}</p>
                <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest mt-0.5">{user ? 'Premium' : 'Scholar'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-black text-sm border-2 border-primary/10 group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300">
                {user ? avatarInitial : '?'}
              </div>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
