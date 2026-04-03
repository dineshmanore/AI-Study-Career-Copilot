import { useEffect, useState } from 'react';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import {
  UserCircle, Plus, Trash2, Sparkles, Download, ChevronLeft,
  ChevronRight, X, Loader2, Check, User, GraduationCap,
  Briefcase, Code, Eye
} from 'lucide-react';
import jsPDF from 'jspdf';

const STEPS = [
  { label: 'Personal Info', icon: User },
  { label: 'Education', icon: GraduationCap },
  { label: 'Experience', icon: Briefcase },
  { label: 'Skills & Projects', icon: Code },
  { label: 'Preview & Export', icon: Eye },
];

const emptyResume = {
  versionName: 'Resume v1',
  personalInfo: { name: '', email: '', phone: '', location: '', linkedin: '', github: '', summary: '' },
  education: [{ institution: '', degree: '', field: '', startYear: '', endYear: '', gpa: '' }],
  workExperience: [{ company: '', role: '', startDate: '', endDate: '', description: '' }],
  skills: [],
  projects: [{ name: '', description: '', techStack: '', link: '' }],
};

export default function Resume() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeResume, setActiveResume] = useState(null);
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ ...emptyResume });
  const [skillInput, setSkillInput] = useState('');
  const [enhancing, setEnhancing] = useState(null);
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsResult, setAtsResult] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchResumes = async () => {
    try {
      const res = await api.get('/resumes');
      setResumes(res.data.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchResumes(); }, []);

  const createNew = async () => {
    try {
      const res = await api.post('/resumes', emptyResume);
      setResumes([res.data.data, ...resumes]);
      setActiveResume(res.data.data);
      setData({
        versionName: res.data.data.versionName,
        personalInfo: { ...emptyResume.personalInfo, ...res.data.data.personalInfo },
        education: res.data.data.education?.length ? res.data.data.education : [...emptyResume.education],
        workExperience: res.data.data.workExperience?.length ? res.data.data.workExperience : [...emptyResume.workExperience],
        skills: res.data.data.skills || [],
        projects: res.data.data.projects?.length ? res.data.data.projects : [...emptyResume.projects],
      });
      setStep(0);
      setAtsResult(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create resume');
    }
  };

  const selectResume = (resume) => {
    setActiveResume(resume);
    setData({
      versionName: resume.versionName,
      personalInfo: { ...emptyResume.personalInfo, ...resume.personalInfo },
      education: resume.education?.length ? resume.education : [...emptyResume.education],
      workExperience: resume.workExperience?.length ? resume.workExperience : [...emptyResume.workExperience],
      skills: resume.skills || [],
      projects: resume.projects?.length ? resume.projects : [...emptyResume.projects],
    });
    setStep(0);
    setAtsResult(resume.atsScore != null ? { score: resume.atsScore, tips: resume.atsTips } : null);
  };

  const saveResume = async () => {
    if (!activeResume) return;
    setSaving(true);
    try {
      const res = await api.put(`/resumes/${activeResume._id}`, data);
      setResumes(resumes.map((r) => (r._id === activeResume._id ? res.data.data : r)));
      setActiveResume(res.data.data);
      toast.success('Resume saved');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const deleteResume = async (id) => {
    if (!confirm('Delete this resume?')) return;
    try {
      await api.delete(`/resumes/${id}`);
      setResumes(resumes.filter((r) => r._id !== id));
      if (activeResume?._id === id) { setActiveResume(null); setStep(0); }
      toast.success('Resume deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const enhance = async (fieldType, content, callback) => {
    setEnhancing(fieldType);
    try {
      const res = await api.post('/ai/enhance-resume-field', { fieldType, content });
      callback(res.data.data.enhancedContent);
      toast.success('Content enhanced!');
    } catch { toast.error('AI service unavailable'); }
    finally { setEnhancing(null); }
  };

  const checkATS = async () => {
    if (!activeResume) return;
    setAtsLoading(true);
    try {
      // Auto-save first so backend reads latest data
      await api.put(`/resumes/${activeResume._id}`, data);
      const res = await api.post('/ai/ats-score', { resumeId: activeResume._id });
      setAtsResult(res.data.data);
      toast.success('ATS score calculated!');
    } catch (err) { toast.error(err.response?.data?.message || 'ATS check failed'); }
    finally { setAtsLoading(false); }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const p = data.personalInfo;
    let y = 20;
    const lm = 20;
    const pageW = 170;
    const pageH = 280;

    const checkPage = (needed = 20) => {
      if (y + needed > pageH) { doc.addPage(); y = 20; }
    };

    // Name
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(p.name || 'Your Name', lm, y);
    y += 8;

    // Contact
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const contact = [p.email, p.phone, p.location].filter(Boolean).join(' | ');
    doc.text(contact, lm, y);
    y += 5;
    const links = [p.linkedin, p.github].filter(Boolean).join(' | ');
    if (links) { doc.text(links, lm, y); y += 5; }
    y += 3;

    // Summary
    if (p.summary) {
      checkPage(30);
      doc.setFontSize(12); doc.setFont('helvetica', 'bold');
      doc.text('PROFESSIONAL SUMMARY', lm, y); y += 6;
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(p.summary, pageW);
      doc.text(lines, lm, y); y += lines.length * 5 + 4;
    }

    // Education
    if (data.education?.some(e => e.institution)) {
      checkPage(30);
      doc.setFontSize(12); doc.setFont('helvetica', 'bold');
      doc.text('EDUCATION', lm, y); y += 6;
      data.education.filter(e => e.institution).forEach(e => {
        checkPage(15);
        doc.setFontSize(10); doc.setFont('helvetica', 'bold');
        doc.text(`${e.degree} in ${e.field}`, lm, y); y += 5;
        doc.setFont('helvetica', 'normal');
        doc.text(`${e.institution} (${e.startYear} - ${e.endYear})${e.gpa ? ' | GPA: ' + e.gpa : ''}`, lm, y); y += 7;
      });
      y += 2;
    }

    // Work Experience
    if (data.workExperience?.some(w => w.company)) {
      checkPage(30);
      doc.setFontSize(12); doc.setFont('helvetica', 'bold');
      doc.text('WORK EXPERIENCE', lm, y); y += 6;
      data.workExperience.filter(w => w.company).forEach(w => {
        checkPage(25);
        doc.setFontSize(10); doc.setFont('helvetica', 'bold');
        doc.text(`${w.role} at ${w.company}`, lm, y); y += 5;
        doc.setFont('helvetica', 'normal');
        doc.text(`${w.startDate} - ${w.endDate || 'Present'}`, lm, y); y += 5;
        if (w.description) {
          const lines = doc.splitTextToSize(w.description, pageW);
          lines.forEach(line => { checkPage(6); doc.text(line, lm, y); y += 5; });
          y += 3;
        }
      });
      y += 2;
    }

    // Skills
    if (data.skills?.length) {
      checkPage(20);
      doc.setFontSize(12); doc.setFont('helvetica', 'bold');
      doc.text('SKILLS', lm, y); y += 6;
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      const skillsText = doc.splitTextToSize(data.skills.join(', '), pageW);
      skillsText.forEach(line => { checkPage(6); doc.text(line, lm, y); y += 5; });
      y += 4;
    }

    // Projects
    if (data.projects?.some(p => p.name)) {
      checkPage(25);
      doc.setFontSize(12); doc.setFont('helvetica', 'bold');
      doc.text('PROJECTS', lm, y); y += 6;
      data.projects.filter(p => p.name).forEach(proj => {
        checkPage(20);
        doc.setFontSize(10); doc.setFont('helvetica', 'bold');
        doc.text(proj.name, lm, y); y += 5;
        doc.setFont('helvetica', 'normal');
        if (proj.techStack) { doc.text(`Tech: ${proj.techStack}`, lm, y); y += 5; }
        if (proj.description) {
          const lines = doc.splitTextToSize(proj.description, pageW);
          lines.forEach(line => { checkPage(6); doc.text(line, lm, y); y += 5; });
          y += 3;
        }
      });
    }

    doc.save(`${data.versionName || 'resume'}.pdf`);
    toast.success('PDF downloaded!');
  };

  const updatePI = (field, value) => setData({ ...data, personalInfo: { ...data.personalInfo, [field]: value } });

  const addSkill = () => {
    if (!skillInput.trim()) return;
    setData({ ...data, skills: [...data.skills, skillInput.trim()] });
    setSkillInput('');
  };

  const removeSkill = (idx) => setData({ ...data, skills: data.skills.filter((_, i) => i !== idx) });

  const updateArray = (key, idx, field, value) => {
    const arr = [...data[key]];
    arr[idx] = { ...arr[idx], [field]: value };
    setData({ ...data, [key]: arr });
  };

  const addArrayItem = (key, template) => setData({ ...data, [key]: [...data[key], template] });
  const removeArrayItem = (key, idx) => setData({ ...data, [key]: data[key].filter((_, i) => i !== idx) });

  // ATS Score color
  const atsColor = (s) => s > 70 ? 'text-success' : s > 40 ? 'text-warning' : 'text-danger';
  const atsBg = (s) => s > 70 ? 'from-success' : s > 40 ? 'from-warning' : 'from-danger';

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  // Resume list view
  if (!activeResume) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy flex items-center gap-2"><UserCircle className="w-7 h-7 text-primary" /> Resume Builder</h1>
            <p className="text-text-secondary text-sm mt-1">Create, enhance, and export professional resumes</p>
          </div>
          <button onClick={createNew} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-lg transition">
            <Plus className="w-4 h-4" /> New Resume
          </button>
        </div>
        {resumes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {resumes.map((r) => (
              <div key={r._id} onClick={() => selectResume(r)}
                className="bg-white rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-navy">{r.versionName}</h3>
                  <button onClick={(e) => { e.stopPropagation(); deleteResume(r._id); }}
                    className="p-1 text-slate-400 hover:text-danger"><Trash2 className="w-4 h-4" /></button>
                </div>
                <p className="text-sm text-text-secondary">{r.personalInfo?.name || 'Untitled'}</p>
                {r.atsScore != null && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`text-sm font-bold ${atsColor(r.atsScore)}`}>ATS: {r.atsScore}/100</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-border">
            <UserCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-text-secondary mb-2">No resumes yet</p>
            <button onClick={createNew} className="text-primary text-sm font-semibold hover:underline">Create your first resume</button>
          </div>
        )}
      </div>
    );
  }

  // Resume editor
  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => setActiveResume(null)} className="flex items-center gap-1 text-text-secondary hover:text-navy text-sm">
          <ChevronLeft className="w-4 h-4" /> All Resumes
        </button>
        <div className="flex gap-2">
          <button onClick={saveResume} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-slate-50 transition">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save
          </button>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-border p-4 overflow-x-auto">
        {STEPS.map((s, i) => (
          <button key={i} onClick={() => setStep(i)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              step === i ? 'bg-primary text-white' : i < step ? 'text-success' : 'text-text-secondary hover:bg-slate-50'
            }`}>
            <s.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
        {/* Step 0: Personal Info */}
        {step === 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-navy">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['name', 'email', 'phone', 'location', 'linkedin', 'github'].map((f) => (
                <div key={f}>
                  <label className="block text-sm font-medium text-text-secondary mb-1 capitalize">{f}</label>
                  <input value={data.personalInfo[f]} onChange={(e) => updatePI(f, e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                    placeholder={f === 'linkedin' ? 'linkedin.com/in/username' : f === 'github' ? 'github.com/username' : ''} />
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-text-secondary">Professional Summary</label>
                <button onClick={() => enhance('professional summary', data.personalInfo.summary, (v) => updatePI('summary', v))}
                  disabled={enhancing === 'professional summary' || !data.personalInfo.summary}
                  className="flex items-center gap-1 text-xs text-accent hover:underline disabled:opacity-50">
                  {enhancing === 'professional summary' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} AI Enhance
                </button>
              </div>
              <textarea value={data.personalInfo.summary} onChange={(e) => updatePI('summary', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none text-sm" rows={4} />
            </div>
          </div>
        )}

        {/* Step 1: Education */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-navy">Education</h3>
              <button onClick={() => addArrayItem('education', { institution: '', degree: '', field: '', startYear: '', endYear: '', gpa: '' })}
                className="text-sm text-primary font-semibold hover:underline flex items-center gap-1"><Plus className="w-4 h-4" /> Add</button>
            </div>
            {data.education.map((edu, i) => (
              <div key={i} className="border border-border rounded-xl p-4 space-y-3 relative">
                {data.education.length > 1 && (
                  <button onClick={() => removeArrayItem('education', i)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-danger"><X className="w-4 h-4" /></button>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[['institution', 'Institution'], ['degree', 'Degree'], ['field', 'Field of Study'], ['startYear', 'Start Year'], ['endYear', 'End Year'], ['gpa', 'GPA']].map(([k, l]) => (
                    <div key={k}>
                      <label className="block text-xs font-medium text-text-secondary mb-1">{l}</label>
                      <input value={edu[k] || ''} onChange={(e) => updateArray('education', i, k, e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 2: Work Experience */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-navy">Work Experience</h3>
              <button onClick={() => addArrayItem('workExperience', { company: '', role: '', startDate: '', endDate: '', description: '' })}
                className="text-sm text-primary font-semibold hover:underline flex items-center gap-1"><Plus className="w-4 h-4" /> Add</button>
            </div>
            {data.workExperience.map((work, i) => (
              <div key={i} className="border border-border rounded-xl p-4 space-y-3 relative">
                {data.workExperience.length > 1 && (
                  <button onClick={() => removeArrayItem('workExperience', i)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-danger"><X className="w-4 h-4" /></button>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[['company', 'Company'], ['role', 'Role'], ['startDate', 'Start Date'], ['endDate', 'End Date']].map(([k, l]) => (
                    <div key={k}>
                      <label className="block text-xs font-medium text-text-secondary mb-1">{l}</label>
                      <input value={work[k] || ''} onChange={(e) => updateArray('workExperience', i, k, e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm" />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-text-secondary">Description</label>
                    <button onClick={() => enhance('work experience description', work.description, (v) => updateArray('workExperience', i, 'description', v))}
                      disabled={enhancing === 'work experience description' || !work.description}
                      className="flex items-center gap-1 text-xs text-accent hover:underline disabled:opacity-50">
                      {enhancing === 'work experience description' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} AI Enhance
                    </button>
                  </div>
                  <textarea value={work.description || ''} onChange={(e) => updateArray('workExperience', i, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none text-sm" rows={3} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 3: Skills & Projects */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-navy mb-3">Skills</h3>
              <div className="flex gap-2 mb-3">
                <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                  placeholder="Add a skill..." />
                <button onClick={addSkill} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold">Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, i) => (
                  <span key={i} className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-primary rounded-full text-sm font-medium">
                    {skill}
                    <button onClick={() => removeSkill(i)} className="text-primary/50 hover:text-danger"><X className="w-3.5 h-3.5" /></button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-navy">Projects</h3>
                <button onClick={() => addArrayItem('projects', { name: '', description: '', techStack: '', link: '' })}
                  className="text-sm text-primary font-semibold hover:underline flex items-center gap-1"><Plus className="w-4 h-4" /> Add</button>
              </div>
              {data.projects.map((proj, i) => (
                <div key={i} className="border border-border rounded-xl p-4 space-y-3 mb-3 relative">
                  {data.projects.length > 1 && (
                    <button onClick={() => removeArrayItem('projects', i)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-danger"><X className="w-4 h-4" /></button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[['name', 'Project Name'], ['techStack', 'Tech Stack'], ['link', 'Link']].map(([k, l]) => (
                      <div key={k}>
                        <label className="block text-xs font-medium text-text-secondary mb-1">{l}</label>
                        <input value={proj[k] || ''} onChange={(e) => updateArray('projects', i, k, e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Description</label>
                    <textarea value={proj.description || ''} onChange={(e) => updateArray('projects', i, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none text-sm" rows={2} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Preview & Export */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-navy">Preview & Export</h3>
              <div className="flex gap-2">
                <button onClick={checkATS} disabled={atsLoading}
                  className="flex items-center gap-2 px-4 py-2 border border-accent text-accent rounded-lg text-sm font-semibold hover:bg-purple-50 transition disabled:opacity-50">
                  {atsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} ATS Score
                </button>
                <button onClick={exportPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold transition">
                  <Download className="w-4 h-4" /> Export PDF
                </button>
              </div>
            </div>

            {/* ATS Result */}
            {atsResult && (
              <div className="bg-slate-50 rounded-xl p-5 animate-fade-in">
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#E2E8F0" strokeWidth="8" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke={
                        atsResult.score > 70 ? '#16A34A' : atsResult.score > 40 ? '#D97706' : '#DC2626'
                      } strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={`${(atsResult.score / 100) * 264} 264`} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-xl font-bold ${atsColor(atsResult.score)}`}>{atsResult.score}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-navy mb-2">Improvement Tips</h4>
                    <ul className="space-y-1">
                      {atsResult.tips?.map((tip, i) => (
                        <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                          <span className="text-accent mt-0.5">•</span> {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Preview */}
            <div className="border border-border rounded-xl p-8 bg-white max-h-[500px] overflow-y-auto" id="resume-preview">
              <h2 className="text-2xl font-bold text-navy">{data.personalInfo.name || 'Your Name'}</h2>
              <p className="text-sm text-text-secondary mt-1">
                {[data.personalInfo.email, data.personalInfo.phone, data.personalInfo.location].filter(Boolean).join(' | ')}
              </p>
              {data.personalInfo.summary && (
                <div className="mt-4">
                  <h3 className="text-sm font-bold text-navy border-b border-border pb-1 mb-2">PROFESSIONAL SUMMARY</h3>
                  <p className="text-sm text-text-primary">{data.personalInfo.summary}</p>
                </div>
              )}
              {data.education.some(e => e.institution) && (
                <div className="mt-4">
                  <h3 className="text-sm font-bold text-navy border-b border-border pb-1 mb-2">EDUCATION</h3>
                  {data.education.filter(e => e.institution).map((e, i) => (
                    <div key={i} className="mb-2">
                      <p className="text-sm font-semibold">{e.degree} in {e.field}</p>
                      <p className="text-xs text-text-secondary">{e.institution} ({e.startYear} - {e.endYear}){e.gpa ? ` | GPA: ${e.gpa}` : ''}</p>
                    </div>
                  ))}
                </div>
              )}
              {data.workExperience.some(w => w.company) && (
                <div className="mt-4">
                  <h3 className="text-sm font-bold text-navy border-b border-border pb-1 mb-2">WORK EXPERIENCE</h3>
                  {data.workExperience.filter(w => w.company).map((w, i) => (
                    <div key={i} className="mb-3">
                      <p className="text-sm font-semibold">{w.role} at {w.company}</p>
                      <p className="text-xs text-text-secondary">{w.startDate} - {w.endDate || 'Present'}</p>
                      {w.description && <p className="text-xs text-text-primary mt-1">{w.description}</p>}
                    </div>
                  ))}
                </div>
              )}
              {data.skills.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-bold text-navy border-b border-border pb-1 mb-2">SKILLS</h3>
                  <p className="text-sm text-text-primary">{data.skills.join(', ')}</p>
                </div>
              )}
              {data.projects.some(p => p.name) && (
                <div className="mt-4">
                  <h3 className="text-sm font-bold text-navy border-b border-border pb-1 mb-2">PROJECTS</h3>
                  {data.projects.filter(p => p.name).map((p, i) => (
                    <div key={i} className="mb-2">
                      <p className="text-sm font-semibold">{p.name}</p>
                      {p.techStack && <p className="text-xs text-text-secondary">Tech: {p.techStack}</p>}
                      {p.description && <p className="text-xs text-text-primary mt-0.5">{p.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
          className="flex items-center gap-1 px-4 py-2 border border-border rounded-lg text-sm font-medium text-text-secondary hover:bg-slate-50 transition disabled:opacity-30">
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <button onClick={() => { saveResume(); setStep(Math.min(4, step + 1)); }} disabled={step === 4}
          className="flex items-center gap-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold transition disabled:opacity-30">
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
