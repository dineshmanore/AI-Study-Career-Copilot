import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import StudyPlan from './pages/StudyPlan';
import Notes from './pages/Notes';
import Chat from './pages/Chat';
import Resume from './pages/Resume';
import Interview from './pages/Interview';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

import { useEffect } from 'react';

export default function App() {
  const { user, loading } = useAuth();

  useEffect(() => {
    const theme = localStorage.getItem('ascc_theme') || 'system';
    document.documentElement.style.filter = '';
    document.documentElement.style.backgroundColor = '';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-text-secondary text-sm">Loading ASCC...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />

      {/* Protected routes */}
      <Route path="/tasks" element={<ProtectedLayout><Tasks /></ProtectedLayout>} />
      <Route path="/study-plan" element={<ProtectedLayout><StudyPlan /></ProtectedLayout>} />
      <Route path="/notes" element={<ProtectedLayout><Notes /></ProtectedLayout>} />
      <Route path="/ask" element={<ProtectedLayout><Chat /></ProtectedLayout>} />
      <Route path="/resume" element={<ProtectedLayout><Resume /></ProtectedLayout>} />
      <Route path="/interview" element={<ProtectedLayout><Interview /></ProtectedLayout>} />
      <Route path="/settings" element={<ProtectedLayout><Settings /></ProtectedLayout>} />
      <Route path="/profile" element={<ProtectedLayout><Profile /></ProtectedLayout>} />

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
