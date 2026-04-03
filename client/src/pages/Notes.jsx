import { useEffect, useState, useRef } from 'react';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import {
  FileText, Upload, Type, Sparkles, Copy, Trash2,
  Search, Loader2, Check, X, FileUp
} from 'lucide-react';

const MODES = ['Quick Summary', 'Detailed Summary', 'Key Concepts'];

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('text'); // 'text' | 'upload'
  const [textContent, setTextContent] = useState('');
  const [summaryMode, setSummaryMode] = useState('Quick Summary');
  const [file, setFile] = useState(null);
  const [summarizing, setSummarizing] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef(null);

  const fetchNotes = async () => {
    try {
      const params = search ? { search } : {};
      const res = await api.get('/notes', { params });
      setNotes(res.data.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchNotes(); }, [search]);

  const handleSummarize = async () => {
    if (tab === 'text' && !textContent.trim()) return toast.error('Please enter some text');
    if (tab === 'upload' && !file) return toast.error('Please upload a file');

    setSummarizing(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('summaryMode', summaryMode);
      if (tab === 'text') {
        formData.append('textContent', textContent);
      } else {
        formData.append('file', file);
      }
      const res = await api.post('/ai/summarize', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data.data);
      setNotes([res.data.data, ...notes]);
      toast.success('Summary generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to summarize');
    } finally { setSummarizing(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this note?')) return;
    try {
      await api.delete(`/notes/${id}`);
      setNotes(notes.filter((n) => n._id !== id));
      if (result?._id === id) setResult(null);
      toast.success('Note deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleCopy = async (text) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB');
      return;
    }
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(f.type)) {
      toast.error('Only PDF and DOCX files are allowed');
      return;
    }
    setFile(f);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
          <FileText className="w-7 h-7 text-primary" /> Notes Summarizer
        </h1>
        <p className="text-text-secondary text-sm mt-1">Paste text or upload files for AI-powered summaries</p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
        {/* Tab Switcher */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit mb-5">
          {[
            { id: 'text', label: 'Paste Text', icon: Type },
            { id: 'upload', label: 'Upload File', icon: Upload },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md transition ${
                tab === t.id ? 'bg-white text-navy shadow-sm' : 'text-text-secondary hover:text-navy'
              }`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Text Input */}
        {tab === 'text' ? (
          <div>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="w-full h-40 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none text-sm"
              placeholder="Paste your notes, article, or study material here..."
              maxLength={10000}
            />
            <p className="text-xs text-text-secondary text-right mt-1">{textContent.length} / 10,000</p>
          </div>
        ) : (
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/40 transition cursor-pointer"
            onClick={() => fileRef.current?.click()}>
            <input ref={fileRef} type="file" onChange={handleFileChange} accept=".pdf,.docx" className="hidden" />
            <FileUp className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            {file ? (
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm font-medium text-navy">{file.name}</span>
                <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-slate-400 hover:text-danger">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-text-secondary">Click to upload PDF or DOCX</p>
                <p className="text-xs text-slate-400 mt-1">Max 5MB</p>
              </>
            )}
          </div>
        )}

        {/* Mode + Generate */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 mt-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-text-secondary mb-1">Summary Mode</label>
            <div className="flex gap-2 flex-wrap">
              {MODES.map((mode) => (
                <button key={mode} onClick={() => setSummaryMode(mode)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition ${
                    summaryMode === mode
                      ? 'border-primary bg-blue-50 text-primary font-semibold'
                      : 'border-border text-text-secondary hover:border-primary/40'
                  }`}>
                  {mode}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleSummarize} disabled={summarizing}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-lg transition disabled:opacity-60">
            {summarizing ? <><Loader2 className="w-4 h-4 animate-spin" /> Summarizing...</> : <><Sparkles className="w-4 h-4" /> Summarize</>}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-white rounded-xl border border-border p-6 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-navy">{result.title}</h3>
            <button onClick={() => handleCopy(result.summaryContent)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-slate-50 transition">
              {copied ? <><Check className="w-4 h-4 text-success" /> Copied</> : <><Copy className="w-4 h-4" /> Copy</>}
            </button>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-50 text-accent">{result.summaryMode}</span>
          <div className="mt-3 text-sm text-text-primary whitespace-pre-line leading-relaxed">{result.summaryContent}</div>
        </div>
      )}

      {/* Saved Notes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-navy">Saved Notes</h2>
          <div className="relative w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              placeholder="Search notes..." />
          </div>
        </div>
        {notes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.map((note) => (
              <div key={note._id} className="bg-white rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-sm font-semibold text-navy flex-1 truncate">{note.title}</h4>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => handleCopy(note.summaryContent)} className="p-1 text-slate-400 hover:text-primary"><Copy className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(note._id)} className="p-1 text-slate-400 hover:text-danger"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-50 text-accent">{note.summaryMode}</span>
                <p className="text-xs text-text-secondary mt-2 line-clamp-3">{note.summaryContent}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-border">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-text-secondary text-sm">{search ? 'No notes match your search' : 'No saved notes yet'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
