import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('appearance');
  const [theme, setTheme] = useState(localStorage.getItem('ascc_theme') || 'system');
  const [aiModel, setAiModel] = useState(localStorage.getItem('ascc_model') || 'gemini-pro');
  const [notifications, setNotifications] = useState({
    email: true,
    browser: false,
    aiUpdates: true,
  });

  useEffect(() => {
    localStorage.setItem('ascc_theme', theme);
    document.documentElement.style.filter = '';
    document.documentElement.style.backgroundColor = '';
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('ascc_model', aiModel);
  }, [aiModel]);

  const tabs = [
    { id: 'appearance', label: 'Theme Center', icon: 'palette' },
    { id: 'intelligence', label: 'AI Preferences', icon: 'psychology' },
    { id: 'notifications', label: 'Communications', icon: 'notifications_active' },
    { id: 'advanced', label: 'Advanced', icon: 'settings_suggest' },
  ];

  return (
    <div className="animate-fade-in space-y-8 max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-headline text-3xl font-black text-on-surface tracking-tight">System Configuration</h1>
          <p className="text-on-surface-variant font-medium mt-1">Fine-tune your intellectual atelier's parameters.</p>
        </div>
        <div className="px-4 py-2 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-primary/20">
          Last Synced: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Main UI Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Tab Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all relative overflow-hidden group ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface border border-outline-variant/10'
              }`}
            >
              <span className={`material-symbols-outlined ${activeTab === tab.id ? 'animate-pulse' : 'group-hover:rotate-12 transition-transform'}`}>{tab.icon}</span>
              {tab.label}
              {activeTab === tab.id && <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />}
            </button>
          ))}
        </div>

        {/* Dynamic Content Panel */}
        <div className="lg:col-span-3">
          <div className="bg-surface-container-lowest rounded-[2.5rem] p-8 md:p-10 border border-outline-variant/15 shadow-sm min-h-[450px] flex flex-col">
            
            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="animate-fade-in space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-on-surface flex items-center gap-2">
                    Visual Mode
                    <span className="h-1.5 w-1.5 bg-primary rounded-full" />
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { id: 'light', label: 'Light', icon: 'light_mode', desc: 'Crisp and clear' },
                      { id: 'dark', label: 'Dark', icon: 'dark_mode', desc: 'Focus-oriented' },
                      { id: 'system', label: 'System', icon: 'settings_brightness', desc: 'Adaptive flow' },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setTheme(mode.id)}
                        className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 active:scale-95 ${
                          theme === mode.id
                            ? 'border-primary bg-primary/5 shadow-inner'
                            : 'border-outline-variant/10 hover:border-primary/30 bg-surface-container-low/30'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-3xl ${theme === mode.id ? 'text-primary' : 'text-on-surface-variant'}`}>{mode.icon}</span>
                        <p className={`font-black uppercase tracking-widest text-[10px] ${theme === mode.id ? 'text-primary' : 'text-on-surface-variant'}`}>{mode.label}</p>
                        <p className="text-[9px] font-bold text-on-surface-variant/40">{mode.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Intelligence Tab */}
            {activeTab === 'intelligence' && (
              <div className="animate-fade-in space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-on-surface flex items-center gap-2">
                    Core Intelligence
                    <span className="h-1.5 w-1.5 bg-primary rounded-full" />
                  </h3>
                  <div className="space-y-4">
                    {[
                      { id: 'gemini-pro', label: 'Gemini 1.5 Pro', desc: 'Superior reasoning and massive context support.', icon: 'bolt' },
                      { id: 'gpt-4o', label: 'GPT-4o Omniscience', desc: 'State-of-the-art general intelligence capabilities.', icon: 'rocket_launch' },
                      { id: 'qwen-plus', label: 'Qwen Plus Optimized', desc: 'Highly efficient, balanced performance.', icon: 'auto_awesome' },
                    ].map((model) => (
                      <button
                        key={model.id}
                        onClick={() => setAiModel(model.id)}
                        className={`w-full p-5 rounded-2xl border-2 transition-all flex items-center gap-5 text-left active:scale-[0.99] ${
                          aiModel === model.id
                            ? 'border-primary bg-primary/5'
                            : 'border-outline-variant/10 hover:border-primary/20 bg-surface-container-low/30'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${aiModel === model.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface-container text-on-surface-variant'}`}>
                          <span className="material-symbols-outlined">{model.icon}</span>
                        </div>
                        <div className="flex-1">
                          <p className={`font-black text-sm ${aiModel === model.id ? 'text-primary' : 'text-on-surface'}`}>{model.label}</p>
                          <p className="text-xs font-medium text-on-surface-variant/60">{model.desc}</p>
                        </div>
                        {aiModel === model.id && <span className="material-symbols-outlined text-primary">check_circle</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="animate-fade-in space-y-6">
                <h3 className="text-lg font-black text-on-surface flex items-center gap-2">
                  Engagement Protocol
                  <span className="h-1.5 w-1.5 bg-primary rounded-full" />
                </h3>
                <div className="space-y-3">
                  {[
                    { key: 'email', label: 'Email Correspondence', desc: 'Weekly progress reports and breakthrough alerts.' },
                    { key: 'browser', label: 'Direct Transmissions', desc: 'Real-time browser notifications for urgent tasks.' },
                    { key: 'aiUpdates', label: 'AI Model Evolution', desc: 'Updates on core engine upgrades and new features.' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-5 bg-surface-container-low/50 rounded-2xl border border-outline-variant/10">
                      <div>
                        <p className="font-black text-sm text-on-surface tracking-tight">{item.label}</p>
                        <p className="text-xs font-medium text-on-surface-variant/60">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                        className={`w-12 h-6 rounded-full p-1 transition-all duration-300 flex ${notifications[item.key] ? 'bg-primary justify-end shadow-lg shadow-primary/20' : 'bg-outline-variant/30 justify-start'}`}
                      >
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Advanced Tab */}
            {activeTab === 'advanced' && (
              <div className="animate-fade-in space-y-8">
                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200/50">
                  <h4 className="flex items-center gap-2 text-warning font-black text-sm uppercase tracking-widest mb-2">
                    <span className="material-symbols-outlined text-[1.1rem]">warning</span>
                    Danger Zone
                  </h4>
                  <p className="text-xs font-medium text-amber-900/60 mb-4 leading-relaxed">
                    Actions here are irreversible. Please ensure you have backed up any critical scholarly data before proceeding.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button className="px-5 py-2.5 bg-white text-danger border border-danger/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-danger hover:text-white transition-all">Export Library</button>
                    <button className="px-5 py-2.5 bg-white text-danger border border-danger/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-danger hover:text-white transition-all">Clear Local Cache</button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 flex items-end justify-end pt-8 mt-auto border-t border-outline-variant/10">
              <button 
                className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95"
                onClick={() => toast.success('Preferences synchronized.')}
              >
                <span className="material-symbols-outlined text-[1.1rem]">sync</span>
                Commit State
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
