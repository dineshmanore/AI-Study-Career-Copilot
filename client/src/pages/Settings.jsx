import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import toast from 'react-hot-toast';

export default function Settings() {
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
  const [activeTab, setActiveTab] = useState('profile');

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) return toast.error('Name cannot be empty');
    setSavingProfile(true);
    try {
      const res = await api.put('/auth/profile', {
        name: profileForm.name,
        email: profileForm.email,
      });
      toast.success('Profile updated!');
      // Update auth context
      if (setUser) setUser(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) return toast.error('Enter your current password');
    if (!passwordForm.newPassword) return toast.error('Enter a new password');
    if (passwordForm.newPassword !== passwordForm.confirmPassword)
      return toast.error('New passwords do not match');

    setSavingPassword(true);
    try {
      await api.put('/auth/profile', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Edit Profile', icon: 'manage_accounts' },
    { id: 'password', label: 'Change Password', icon: 'lock' },
    { id: 'about', label: 'About', icon: 'info' },
  ];

  return (
    <div className="animate-fade-in space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="font-headline text-3xl font-extrabold text-on-surface">Settings</h1>
        <p className="text-on-surface-variant mt-1">Manage your account and preferences.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-outline-variant/30 pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-t-xl border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[1rem]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/15 shadow-sm animate-fade-in">
          <h2 className="font-headline text-xl font-bold text-on-surface mb-6">Edit Profile</h2>

          {/* Avatar Preview */}
          <div className="flex items-center gap-5 mb-8">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-extrabold shadow-lg">
              {profileForm.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p className="font-bold text-on-surface text-lg">{profileForm.name || 'Your Name'}</p>
              <p className="text-on-surface-variant text-sm">{profileForm.email}</p>
              <p className="text-xs text-on-surface-variant mt-1">
                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Full Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Email Address</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition"
                placeholder="your@email.com"
              />
            </div>
            <button
              type="submit"
              disabled={savingProfile}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[1rem]">save</span>
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/15 shadow-sm animate-fade-in">
          <h2 className="font-headline text-xl font-bold text-on-surface mb-6">Change Password</h2>
          <form onSubmit={handlePasswordSave} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition"
                placeholder="Min 8 chars, 1 uppercase, 1 number"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition"
                placeholder="Repeat new password"
              />
            </div>
            <button
              type="submit"
              disabled={savingPassword}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[1rem]">lock_reset</span>
              {savingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}

      {/* About Tab */}
      {activeTab === 'about' && (
        <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/15 shadow-sm animate-fade-in">
          <h2 className="font-headline text-xl font-bold text-on-surface mb-6">About Scholarly Edge</h2>
          <div className="space-y-4 text-sm text-on-surface-variant">
            <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-2xl">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
              </div>
              <div>
                <p className="font-bold text-on-surface text-base">Scholarly Edge v1.0</p>
                <p>AI Study &amp; Career Copilot</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {[
                { label: 'AI Engine', value: 'Qwen 3.6 Plus (Free)' },
                { label: 'Provider', value: 'OpenRouter API' },
                { label: 'Context Window', value: '1M tokens' },
                { label: 'Cost', value: '$0.00 / month' },
              ].map((item) => (
                <div key={item.label} className="p-4 bg-surface-container rounded-xl">
                  <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">{item.label}</p>
                  <p className="font-bold text-on-surface mt-1">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
