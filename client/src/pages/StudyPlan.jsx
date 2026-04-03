import { useEffect, useState } from 'react';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import { BookOpen, Plus, Trash2, ChevronDown, ChevronUp, Sparkles, Calendar, Clock, GraduationCap, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import Markdown from '../components/Markdown';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export default function StudyPlan() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [form, setForm] = useState({ subject: '', examDate: '', dailyHours: 2, knowledgeLevel: 'Beginner' });

  const fetchPlans = async () => {
    try {
      const res = await api.get('/study-plans');
      setPlans(res.data.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.examDate) return toast.error('Subject and exam date are required');
    setGenerating(true);
    try {
      const res = await api.post('/ai/study-plan', form);
      setPlans([res.data.data, ...plans]);
      setShowForm(false);
      setExpanded(res.data.data._id);
      setForm({ subject: '', examDate: '', dailyHours: 2, knowledgeLevel: 'Beginner' });
      toast.success('Study plan generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate plan');
    } finally { setGenerating(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this study plan?')) return;
    try {
      await api.delete(`/study-plans/${id}`);
      setPlans(plans.filter((p) => p._id !== id));
      toast.success('Plan deleted');
    } catch { toast.error('Failed to delete'); }
  };

  // Parse plan text into weeks
  const parseWeeks = (text) => {
    if (!text) return [];
    const sections = text.split(/(?=##\s*Week\s*\d|(?:^|\n)\*\*Week\s*\d)/gi);
    return sections.filter((s) => s.trim()).map((s, i) => {
      const lines = s.trim().split('\n');
      const title = lines[0].replace(/^#+\s*/, '').replace(/\*\*/g, '').trim();
      const content = lines.slice(1).join('\n').trim();
      return { title: title || `Section ${i + 1}`, content };
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-primary" /> Study Plan Generator
          </h1>
          <p className="text-text-secondary text-sm mt-1">AI-powered week-by-week study schedules</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-lg transition">
          <Plus className="w-4 h-4" /> Generate New Plan
        </button>
      </div>

      {/* Generate Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-border p-6 shadow-sm animate-fade-in">
          <h3 className="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" /> New Study Plan
          </h3>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Subject / Topic *</label>
                <input value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  placeholder="e.g. Data Structures & Algorithms" maxLength={200} />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Exam Date *</label>
                <input type="date" value={form.examDate} onChange={(e) => setForm({...form, examDate: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Daily Study Hours</label>
                <input type="number" value={form.dailyHours} onChange={(e) => setForm({...form, dailyHours: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  min={1} max={12} />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Knowledge Level</label>
                <select value={form.knowledgeLevel} onChange={(e) => setForm({...form, knowledgeLevel: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                  {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-text-secondary hover:bg-slate-50 transition">Cancel</button>
              <button type="submit" disabled={generating}
                className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-lg transition disabled:opacity-60">
                {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Plan</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Plans List */}
      {plans.length > 0 ? (
        <div className="space-y-4">
          {plans.map((plan) => {
            const weeks = parseWeeks(plan.generatedPlan);
            const isOpen = expanded === plan._id;
            return (
              <div key={plan._id} className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50 transition"
                  onClick={() => setExpanded(isOpen ? null : plan._id)}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-navy truncate">{plan.subject}</h3>
                      <div className="flex items-center gap-3 text-xs text-text-secondary mt-0.5">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Exam: {format(new Date(plan.examDate), 'MMM d, yyyy')}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {plan.dailyHours}h/day</span>
                        <span className="px-1.5 py-0.5 bg-purple-50 text-accent rounded text-[10px] font-semibold">{plan.knowledgeLevel}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(plan._id); }}
                      className="p-1.5 text-slate-400 hover:text-danger"><Trash2 className="w-4 h-4" /></button>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </div>
                </div>
                {isOpen && (
                  <div className="border-t border-border p-5 animate-fade-in bg-slate-50/30">
                    <Markdown content={plan.generatedPlan} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : !showForm && (
        <div className="text-center py-16 bg-white rounded-xl border border-border">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-text-secondary mb-2">No study plans yet</p>
          <button onClick={() => setShowForm(true)} className="text-primary text-sm font-semibold hover:underline">Generate your first plan</button>
        </div>
      )}
    </div>
  );
}
