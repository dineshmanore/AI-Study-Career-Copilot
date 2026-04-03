import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import { Link } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';

const statCards = [
  { to: '/tasks',       key: 'tasksDueToday',    label: 'Tasks Today',     icon: 'task_alt',       color: 'text-primary',  bg: 'bg-blue-50',  badge: '+2 new',   badgeColor: 'text-primary' },
  { to: '/notes',       key: 'notesSaved',       label: 'Notes Saved',         icon: 'sticky_note_2',  color: 'text-secondary',bg: 'bg-purple-50', badge: 'Total',    badgeColor: 'text-secondary' },
  { to: '/resume',      key: 'resumesCreated',   label: 'Resumes Created',     icon: 'description',    color: 'text-tertiary', bg: 'bg-orange-50', badge: 'Active',   badgeColor: 'text-tertiary' },
  { to: '/study-plan',  key: 'studyPlansActive', label: 'Study Plans Active',  icon: 'menu_book',      iconColor: 'text-on-primary-fixed-variant', iconBg: 'bg-blue-50', badge: 'In Progress', badgeColor: 'text-on-primary-fixed-variant' },
];

const quickActions = [
  { to: '/tasks',       icon: 'add_circle',            label: '+ New Task',      style: 'bg-surface-container-lowest hover:bg-primary hover:text-white border border-outline-variant/10' },
  { to: '/study-plan',  icon: 'auto_awesome_motion',   label: 'Generate Plan',   style: 'bg-surface-container-lowest hover:bg-primary hover:text-white border border-outline-variant/10' },
  { to: '/notes',       icon: 'summarize',             label: 'Summarize',       style: 'bg-surface-container-lowest hover:bg-primary hover:text-white border border-outline-variant/10' },
  { to: '/ask',         icon: 'smart_toy',             label: 'Ask AI Copilot',  style: 'bg-primary text-white shadow-lg shadow-primary/20', filled: true },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiQuery, setAiQuery] = useState('');

  useEffect(() => {
    api.get('/dashboard/stats')
      .then((res) => setStats(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-10">

      {/* ── Welcome Header ── */}
      <section className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight leading-tight">
            {greeting}, {user ? user.name.split(' ')[0] : 'Scholar'} 👋
          </h1>
          <p className="text-on-surface-variant mt-2 text-base">
            Your intellectual atelier is ready for today's breakthroughs.
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-secondary-fixed text-on-secondary-fixed rounded-full text-xs font-bold shadow-sm">
          <span className="material-symbols-outlined text-sm">auto_awesome</span>
          AI Engine: Active
        </div>
      </section>

      {/* ── Stat Cards Bento ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <Link
            key={card.key}
            to={card.to}
            className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/15 hover:shadow-md transition-all group block no-underline"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-xl group-hover:scale-110 transition-transform ${
                card.key === 'tasksDueToday' ? 'bg-blue-50 text-primary' :
                card.key === 'notesSaved' ? 'bg-purple-50 text-secondary' :
                card.key === 'resumesCreated' ? 'bg-orange-50 text-tertiary' :
                'bg-blue-50 text-on-primary-fixed-variant'
              }`}>
                <span className="material-symbols-outlined">{card.icon}</span>
              </div>
              <span className={`text-xs font-bold ${card.badgeColor}`}>{card.badge}</span>
            </div>
            <p className="text-3xl font-headline font-extrabold text-on-surface">
              {stats?.[card.key] ?? 0}
            </p>
            <p className="text-on-surface-variant text-sm font-medium mt-1">{card.label}</p>
          </Link>
        ))}
      </section>

      {/* ── Main Asymmetric Grid ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left: Content Workspace */}
        <div className="lg:col-span-8 space-y-8">

          {/* Precision Tools */}
          <div className="bg-surface-container rounded-3xl p-8">
            <h2 className="font-headline text-xl font-bold mb-6 text-on-surface">Precision Tools</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all group ${action.style}`}
                >
                  <span
                    className="material-symbols-outlined mb-2 group-hover:scale-125 transition-transform"
                    style={action.filled ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {action.icon}
                  </span>
                  <span className="text-xs font-bold text-center">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/15">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-headline text-xl font-bold text-on-surface">Recent Activity</h2>
            </div>

            {stats?.recentActivity?.length > 0 ? (
              <div className="space-y-2">
                {stats.recentActivity.slice(0, 5).map((item, i) => {
                  const typeStyles = {
                    task:   { icon: 'task_alt',    color: 'bg-primary/10 text-primary',     to: '/tasks' },
                    note:   { icon: 'sticky_note_2', color: 'bg-secondary/10 text-secondary',  to: '/notes' },
                    resume: { icon: 'description',   color: 'bg-tertiary/10 text-tertiary',   to: '/resume' },
                    plan:   { icon: 'menu_book',     color: 'bg-navy/10 text-on-primary-fixed-variant', to: '/study-plan' },
                    chat:   { icon: 'smart_toy',     color: 'bg-primary/10 text-primary',     to: '/ask' },
                  };
                  const config = typeStyles[item.type] || { icon: 'history', color: 'bg-surface-container text-on-surface-variant', to: '#' };
                  
                  return (
                    <Link
                      key={i}
                      to={config.to}
                      className="flex gap-4 items-center p-4 rounded-2xl hover:bg-surface-container-low transition-colors group no-underline"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.color}`}>
                        <span className="material-symbols-outlined text-[1.1rem]">{config.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-on-surface font-medium truncate group-hover:text-primary transition-colors">
                          {item.label}
                        </p>
                      </div>
                      <span className="text-xs text-on-surface-variant whitespace-nowrap">
                        {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center">
                <span className="material-symbols-outlined text-4xl text-outline-variant mb-3 block">auto_awesome</span>
                <p className="text-on-surface-variant text-sm">
                  No activity yet. Start by creating a task or generating a study plan!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: AI Copilot Panel */}
        <div className="lg:col-span-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-outline-variant/15 shadow-2xl shadow-primary/5 relative overflow-hidden sticky top-6">
            {/* Decorative glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/8 blur-[60px] rounded-full pointer-events-none" />

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                </div>
                <div>
                  <h3 className="font-headline font-extrabold text-on-surface text-base">Copilot Insights</h3>
                  <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Real-time analysis</span>
                </div>
              </div>

              {/* Insights */}
              <div className="space-y-5">
                <div className="bg-surface-container-low p-5 rounded-2xl border border-primary/10">
                  <p className="text-xs font-bold text-primary mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">trending_up</span>
                    SMART RECOMMENDATION
                  </p>
                  <p className="text-sm font-medium text-on-surface">
                    You have {stats?.studyPlansActive ?? 0} active study plan(s). Keep up your daily streak to hit your exam goal on time!
                  </p>
                  <Link
                    to="/study-plan"
                    className="mt-4 w-full py-2 bg-white text-primary border border-primary/20 rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">menu_book</span>
                    View Study Plans
                  </Link>
                </div>

                <div className="bg-secondary-fixed/30 p-5 rounded-2xl">
                  <p className="text-xs font-bold text-on-secondary-fixed mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">lightbulb</span>
                    DAILY TIP
                  </p>
                  <p className="text-sm font-medium text-on-surface">
                    Use the <span className="text-primary font-bold">Summarizer</span> to convert your lecture notes into concise bullet points for better retention.
                  </p>
                </div>

                {/* Skill tags */}
                <div className="space-y-3 pt-3 border-t border-outline-variant/10">
                  <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Quick Links</h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'AI Chat', to: '/ask' },
                      { label: 'Resume', to: '/resume' },
                      { label: 'Interview', to: '/interview' },
                      { label: 'Notes', to: '/notes' },
                    ].map((tag) => (
                      <Link
                        key={tag.label}
                        to={tag.to}
                        className="px-3 py-1 bg-secondary-fixed text-on-secondary-fixed rounded-full text-[10px] font-bold hover:bg-primary hover:text-white transition-all"
                      >
                        {tag.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick AI Input */}
              <div className="mt-8">
                <Link to={`/ask${aiQuery ? `?q=${encodeURIComponent(aiQuery)}` : ''}`} className="block">
                  <div className="relative">
                    <input
                      className="w-full bg-surface-container-lowest border-2 border-primary/10 rounded-2xl py-4 pl-4 pr-14 text-sm font-medium focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none placeholder:text-on-surface-variant/60"
                      placeholder="Ask Copilot anything..."
                      type="text"
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && aiQuery.trim()) navigate('/ask');
                      }}
                    />
                    <Link to="/ask" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition">
                      <span className="material-symbols-outlined text-sm">send</span>
                    </Link>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
