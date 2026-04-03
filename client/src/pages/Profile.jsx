import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, setUser } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('info');

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) return toast.error('Name cannot be empty');
    setSavingProfile(true);
    try {
      const res = await api.put('/auth/profile', {
        name: profileForm.name,
        email: profileForm.email,
      });
      toast.success('Identity updated!');
      if (setUser) setUser(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) return toast.error('Current password required');
    if (passwordForm.newPassword !== passwordForm.confirmPassword)
      return toast.error('New passwords do not match');

    setSavingPassword(true);
    try {
      await api.put('/auth/profile', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Security credentials updated!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Security update failed');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-8 max-w-4xl mx-auto pb-20">
      {/* Header Card */}
      <section className="relative overflow-hidden bg-primary rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl font-black border-4 border-white/30 shadow-xl">
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">{user?.name}</h1>
            <p className="text-primary-fixed opacity-90 font-medium">{user?.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
              <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">Premium Scholar</span>
              <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 font-mono">ID: {user?._id?.slice(-6)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          {[
            { id: 'info', label: 'Personal Information', icon: 'person' },
            { id: 'security', label: 'Security & Access', icon: 'security' },
            { id: 'stats', label: 'Scholarly Impact', icon: 'analytics' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${
                activeSubTab === tab.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                  : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Area */}
        <div className="lg:col-span-2">
          {activeSubTab === 'info' && (
            <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/15 shadow-sm animate-fade-in">
              <h2 className="font-headline text-xl font-bold text-on-surface mb-8">Identity Update</h2>
              <form onSubmit={handleProfileSave} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-on-surface/40 uppercase tracking-widest ml-1">Legal Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant/10 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold"
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-on-surface/40 uppercase tracking-widest ml-1">Contact Email</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant/10 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full md:w-auto px-8 py-4 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50"
                >
                  {savingProfile ? 'Updating...' : 'Commit Changes'}
                </button>
              </form>
            </div>
          )}

          {activeSubTab === 'security' && (
            <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/15 shadow-sm animate-fade-in">
              <h2 className="font-headline text-xl font-bold text-on-surface mb-8">Security Protocol</h2>
              <form onSubmit={handlePasswordSave} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-on-surface/40 uppercase tracking-widest ml-1">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant/10 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold"
                    placeholder="Verification required"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-on-surface/40 uppercase tracking-widest ml-1">New Credential</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant/10 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-on-surface/40 uppercase tracking-widest ml-1">Confirm New</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant/10 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold"
                      placeholder="Repeat new password"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="w-full md:w-auto px-8 py-4 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50"
                >
                  {savingPassword ? 'Encrypting...' : 'Update Security'}
                </button>
              </form>
            </div>
          )}

          {activeSubTab === 'stats' && (
            <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/15 shadow-sm animate-fade-in">
              <h2 className="font-headline text-xl font-bold text-on-surface mb-8">Scholarly Impact</h2>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: 'Active Tasks', value: '12', icon: 'task_alt', color: 'text-primary' },
                  { label: 'Saved Insights', value: '48', icon: 'sticky_note_2', color: 'text-secondary' },
                  { label: 'Study Streak', value: '7 Days', icon: 'local_fire_department', color: 'text-orange-500' },
                  { label: 'Career Score', value: '850', icon: 'military_tech', color: 'text-amber-500' },
                ].map((stat) => (
                  <div key={stat.label} className="p-6 bg-surface-container-low rounded-[2rem] border border-outline-variant/5 group hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all">
                    <span className={`material-symbols-outlined ${stat.color} mb-3 transition-transform group-hover:scale-125`}>{stat.icon}</span>
                    <p className="text-3xl font-headline font-black text-on-surface tracking-tight">{stat.value}</p>
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mt-1 opacity-60">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
