import { useEffect, useState } from 'react';
import api from '../utils/axios';
import toast from 'react-hot-toast';

const TOPICS = ['DSA', 'System Design', 'HR', 'Frontend', 'Backend', 'Data Science', 'Core CS'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const diffColors = {
  Easy:   'bg-green-50 text-success border-green-200',
  Medium: 'bg-amber-50 text-warning border-amber-200',
  Hard:   'bg-red-100/50 text-danger border-red-200',
};

export default function Interview() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [mockMode, setMockMode] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [evaluations, setEvaluations] = useState({});
  const [evaluating, setEvaluating] = useState(null);
  const [savingSession, setSavingSession] = useState(false);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/interview-sessions');
      setSessions(res.data.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchSessions(); }, []);

  const handleGenerate = async () => {
    const t = customTopic || topic;
    if (!t) return toast.error('Please select or enter a topic');
    setGenerating(true);
    setQuestions(null);
    setMockMode(false);
    setUserAnswers({});
    setEvaluations({});
    try {
      const res = await api.post('/ai/interview-questions', { topic: t, difficulty });
      setQuestions(res.data.data.questions);
      toast.success('Questions generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate questions');
    } finally { setGenerating(false); }
  };

  const handleEvaluate = async (idx) => {
    const q = questions[idx];
    const answer = userAnswers[idx];
    if (!answer?.trim()) return toast.error('Please write your answer first');
    setEvaluating(idx);
    try {
      const res = await api.post('/ai/evaluate-answer', {
        questionText: q.questionText,
        userAnswer: answer,
        modelAnswer: q.modelAnswer,
      });
      setEvaluations({ ...evaluations, [idx]: res.data.data });
      toast.success('Answer evaluated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Evaluation failed');
    } finally { setEvaluating(null); }
  };

  const handleSaveSession = async () => {
    if (!questions) return;
    setSavingSession(true);
    const t = customTopic || topic;
    try {
      const sessionData = {
        sessionName: `${t} - ${new Date().toLocaleDateString()}`,
        topic: t,
        difficulty,
        questions: questions.map((q, i) => ({
          questionText: q.questionText,
          modelAnswer: q.modelAnswer,
          userAnswer: userAnswers[i] || '',
          score: evaluations[i]?.score ?? null,
          feedback: evaluations[i]?.feedback || '',
        })),
      };
      const res = await api.post('/interview-sessions', sessionData);
      setSessions([res.data.data, ...sessions]);
      toast.success('Session saved!');
    } catch { toast.error('Failed to save session'); }
    finally { setSavingSession(false); }
  };

  const handleDeleteSession = async (id) => {
    if (!confirm('Delete this session?')) return;
    try {
      await api.delete(`/interview-sessions/${id}`);
      setSessions(sessions.filter((s) => s._id !== id));
      toast.success('Session deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const loadSession = async (id) => {
    try {
      const res = await api.get(`/interview-sessions/${id}`);
      const s = res.data.data;
      setTopic(s.topic);
      setDifficulty(s.difficulty);
      setQuestions(s.questions.map((q) => ({ questionText: q.questionText, modelAnswer: q.modelAnswer })));
      setUserAnswers(Object.fromEntries(s.questions.map((q, i) => [i, q.userAnswer])));
      setEvaluations(Object.fromEntries(s.questions.filter(q => q.score != null).map((q, i) => [i, { score: q.score, feedback: q.feedback }])));
      setMockMode(false);
      setExpanded(null);
    } catch { toast.error('Failed to load session'); }
  };

  const scoreColor = (s) => s >= 7 ? 'text-success' : s >= 4 ? 'text-warning' : 'text-danger';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">work_history</span>
            Interview Prep
          </h1>
          <p className="text-on-surface-variant mt-2 text-base">AI-generated mock interviews for the modern professional.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Generator Controls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/15 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-bold text-on-surface mb-3">Target Topic</label>
              <div className="flex flex-wrap gap-2 mb-4">
                {TOPICS.map((t) => (
                  <button key={t} onClick={() => { setTopic(t); setCustomTopic(''); }}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                      topic === t && !customTopic
                        ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                        : 'bg-surface-container-low text-on-surface-variant border-transparent hover:border-primary/30'
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
              <input value={customTopic} onChange={(e) => { setCustomTopic(e.target.value); setTopic(''); }}
                className="w-full px-4 py-3 bg-surface-container-low border border-transparent rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium"
                placeholder="Or enter a custom role or technology..." />
            </div>

            <div>
              <label className="block text-sm font-bold text-on-surface mb-3">Difficulty Level</label>
              <div className="flex gap-3">
                {DIFFICULTIES.map((d) => (
                  <button key={d} onClick={() => setDifficulty(d)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                      difficulty === d
                        ? `${diffColors[d]} border-current shadow-sm`
                        : 'bg-surface-container-low text-on-surface-variant border-transparent hover:border-primary/20'
                    }`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleGenerate} disabled={generating}
              className="w-full flex items-center justify-center gap-3 py-4 bg-primary text-white text-sm font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50">
              {generating ? (
                <><span className="material-symbols-outlined animate-spin">sync</span> Generating Questions...</>
              ) : (
                <><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span> Start AI Interview</>
              )}
            </button>
          </div>

          {/* Questions Render */}
          {questions && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between px-2">
                <h2 className="font-headline text-xl font-bold text-on-surface">{questions.length} Session Questions</h2>
                <div className="flex gap-2">
                  <button onClick={() => setMockMode(!mockMode)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      mockMode ? 'bg-secondary text-white border-secondary' : 'bg-white text-on-surface-variant border-outline-variant/30 hover:border-primary'
                    }`}>
                    <span className="material-symbols-outlined text-sm">{mockMode ? 'visibility' : 'play_circle'}</span>
                    {mockMode ? 'View Answers' : 'Mock Mode'}
                  </button>
                  <button onClick={handleSaveSession} disabled={savingSession}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-on-surface-variant border border-outline-variant/30 rounded-xl text-xs font-bold hover:bg-surface-container-low transition-all">
                    <span className="material-symbols-outlined text-sm">save</span>
                    {savingSession ? 'Saving...' : 'Save Session'}
                  </button>
                </div>
              </div>

              {questions.map((q, i) => {
                const isOpen = expanded === i;
                return (
                  <div key={i} className="bg-surface-container-lowest rounded-3xl border border-outline-variant/15 shadow-sm overflow-hidden transition-all hover:bg-surface-bright">
                    <div className="flex items-center gap-4 p-5 cursor-pointer" onClick={() => setExpanded(isOpen ? null : i)}>
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">{i + 1}</div>
                      <p className="text-sm font-bold text-on-surface flex-1 leading-snug">{q.questionText}</p>
                      {evaluations[i] && (
                        <div className={`px-3 py-1 rounded-full text-xs font-black bg-surface-container-low ${scoreColor(evaluations[i].score)}`}>
                          {evaluations[i].score}/10
                        </div>
                      )}
                      <span className="material-symbols-outlined text-on-surface-variant">{isOpen ? 'expand_less' : 'expand_more'}</span>
                    </div>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-0 space-y-4 animate-fade-in">
                        {mockMode && (
                          <div className="space-y-3">
                            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Your Response</label>
                            <textarea
                              value={userAnswers[i] || ''}
                              onChange={(e) => setUserAnswers({ ...userAnswers, [i]: e.target.value })}
                              className="w-full p-4 bg-surface-container-low border-none rounded-2xl focus:ring-2 focus:ring-primary/20 resize-none text-sm font-medium h-32"
                              placeholder="Record your answer here for AI evaluation..." />
                            <button onClick={() => handleEvaluate(i)} disabled={evaluating === i}
                              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl shadow-md shadow-primary/10 hover:bg-primary-dark transition-all disabled:opacity-60">
                              {evaluating === i ? <span className="material-symbols-outlined animate-spin">sync</span> : <span className="material-symbols-outlined">analytics</span>}
                              Evaluate Answer
                            </button>
                          </div>
                        )}

                        {evaluations[i] && (
                          <div className="bg-secondary-fixed/20 rounded-2xl p-4 border border-secondary/10">
                            <div className="flex items-center gap-2 mb-2 text-on-secondary-fixed">
                              <span className="material-symbols-outlined font-bold">verified</span>
                              <span className="font-bold">AI Feedback &bull; {evaluations[i].score}/10</span>
                            </div>
                            <p className="text-sm text-on-surface font-medium leading-relaxed">{evaluations[i].feedback}</p>
                          </div>
                        )}

                        {(!mockMode || evaluations[i]) && (
                          <div className="bg-surface-container-low rounded-2xl p-4">
                            <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Model Answer Reference</h4>
                            <p className="text-sm text-on-surface leading-relaxed">{q.modelAnswer}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Sessions List */}
        <div className="space-y-4">
          <h2 className="font-headline text-lg font-bold text-on-surface px-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">history</span>
            Past Sessions
          </h2>
          <div className="space-y-3">
            {sessions.length > 0 ? sessions.map((s) => (
              <div key={s._id} className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/15 flex items-center gap-3 group transition-all hover:border-primary/30">
                <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-xl">calendar_today</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors cursor-pointer" onClick={() => loadSession(s._id)}>
                    {s.sessionName}
                  </p>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase">{s.topic} &bull; {s.difficulty}</p>
                </div>
                <button onClick={() => handleDeleteSession(s._id)} className="text-outline-variant hover:text-danger p-1 transition-colors">
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            )) : (
              <div className="text-center py-10 opacity-40">
                <span className="material-symbols-outlined text-4xl block mb-2">hourglass_empty</span>
                <p className="text-xs font-bold">No saved sessions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
