import { useEffect, useState } from 'react';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import { format, isPast, isToday } from 'date-fns';

const STATUSES = ['Todo', 'In Progress', 'Done'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const priorityStyles = {
  Low:    'bg-blue-50 text-primary border-primary/10',
  Medium: 'bg-amber-50 text-warning border-warning/10',
  High:   'bg-red-50 text-danger border-danger/10',
};

const statusConfig = {
  'Todo':        { icon: 'radio_button_unchecked', color: 'text-on-surface-variant', bg: 'bg-surface-container-low' },
  'In Progress': { icon: 'published_with_changes', color: 'text-primary', bg: 'bg-primary/5' },
  'Done':        { icon: 'check_circle', color: 'text-success', bg: 'bg-success/5' },
};

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('kanban');
  const [modal, setModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', priority: 'Medium', status: 'Todo' });

  const fetchTasks = async () => {
    try {
      const params = {};
      if (filterPriority) params.priority = filterPriority;
      if (filterStatus) params.status = filterStatus;
      const res = await api.get('/tasks', { params });
      setTasks(res.data.data);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, [filterPriority, filterStatus]);

  const openCreate = () => {
    setEditingTask(null);
    setForm({ title: '', description: '', dueDate: '', priority: 'Medium', status: 'Todo' });
    setModal(true);
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
      priority: task.priority,
      status: task.status,
    });
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    try {
      if (editingTask) {
        const res = await api.put(`/tasks/${editingTask._id}`, form);
        setTasks(tasks.map((t) => (t._id === editingTask._id ? res.data.data : t)));
        toast.success('Task updated');
      } else {
        const res = await api.post('/tasks', form);
        setTasks([res.data.data, ...tasks]);
        toast.success('Task created');
      }
      setModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    }
  };

  const handleDelete = (id) => {
    if (!confirm('Permanently delete this task?')) return;
    api.delete(`/tasks/${id}`)
      .then(() => {
        setTasks(tasks.filter((t) => t._id !== id));
        toast.success('Task deleted');
      })
      .catch(() => toast.error('Failed to delete'));
  };

  const toggleStatus = async (task) => {
    const nextStatus = task.status === 'Done' ? 'Todo' : 'Done';
    try {
      const res = await api.put(`/tasks/${task._id}`, { status: nextStatus });
      setTasks(tasks.map((t) => (t._id === task._id ? res.data.data : t)));
      toast.success(`Task marked as ${nextStatus}`);
    } catch { toast.error('Failed to update status'); }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      const res = await api.put(`/tasks/${task._id}`, { status: newStatus });
      setTasks(tasks.map((t) => (t._id === task._id ? res.data.data : t)));
    } catch { toast.error('Failed to update status'); }
  };

  const isOverdue = (task) =>
    task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && task.status !== 'Done';

  const TaskCard = ({ task }) => (
    <div className={`group bg-surface-container-lowest rounded-2xl border ${isOverdue(task) ? 'border-danger/30' : 'border-outline-variant/15'} p-5 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all animate-fade-in relative`}>
      <div className="flex items-start gap-3 mb-3">
        <button 
          onClick={() => toggleStatus(task)}
          className={`mt-0.5 flex-shrink-0 transition-all ${statusConfig[task.status].color} hover:scale-110 active:scale-95`}
        >
          <span className="material-symbols-outlined text-[1.4rem]" style={task.status === 'Done' ? { fontVariationSettings: "'FILL' 1" } : {}}>
            {statusConfig[task.status].icon}
          </span>
        </button>
        <div className="flex-1 min-w-0" onClick={() => openEdit(task)}>
          <h4 className={`text-sm font-bold text-on-surface leading-tight cursor-pointer group-hover:text-primary transition-colors ${task.status === 'Done' ? 'line-through opacity-40' : ''}`}>
            {task.title}
          </h4>
          {task.description && <p className="text-xs text-on-surface-variant mt-1 line-clamp-2 leading-relaxed">{task.description}</p>}
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-outline-variant/5">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${priorityStyles[task.priority]}`}>
            {task.priority}
          </span>
          {task.dueDate && (
            <span className={`text-[10px] font-bold flex items-center gap-1 ${isOverdue(task) ? 'text-danger' : 'text-on-surface-variant'}`}>
              <span className="material-symbols-outlined text-xs">calendar_today</span>
              {format(new Date(task.dueDate), 'MMM d')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => openEdit(task)} className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all">
            <span className="material-symbols-outlined text-sm">edit</span>
          </button>
          <button onClick={() => handleDelete(task._id)} className="p-1.5 rounded-lg text-on-surface-variant hover:text-danger hover:bg-danger/5 transition-all">
            <span className="material-symbols-outlined text-sm">delete</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-end gap-6">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">task_alt</span>
            Task Manager
          </h1>
          <p className="text-on-surface-variant mt-2 text-base">Organize your academic workload with precision.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-1 bg-surface-container rounded-xl flex">
            <button onClick={() => setView('kanban')} 
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold transition-all ${view === 'kanban' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant'}`}>
              <span className="material-symbols-outlined text-sm">view_kanban</span>
              Board
            </button>
            <button onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold transition-all ${view === 'list' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant'}`}>
              <span className="material-symbols-outlined text-sm">view_list</span>
              List
            </button>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95">
            <span className="material-symbols-outlined text-sm">add</span>
            New Task
          </button>
        </div>
      </div>

      {/* Filters Overlay */}
      <div className="flex gap-4 items-center bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/15 shadow-sm overflow-x-auto">
        <div className="flex items-center gap-2 text-on-surface-variant flex-shrink-0">
          <span className="material-symbols-outlined text-[1.2rem]">filter_list</span>
          <span className="text-xs font-black uppercase tracking-widest pl-1">Filters</span>
        </div>
        <div className="w-px h-6 bg-outline-variant/20 mx-2 flex-shrink-0" />
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}
          className="text-xs font-bold bg-surface-container-low border-none rounded-xl px-4 py-2 hover:bg-surface-container transition-colors outline-none focus:ring-2 focus:ring-primary/20">
          <option value="">All Priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="text-xs font-bold bg-surface-container-low border-none rounded-xl px-4 py-2 hover:bg-surface-container transition-colors outline-none focus:ring-2 focus:ring-primary/20">
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="flex-1" />
        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest bg-secondary-fixed/30 px-3 py-1 rounded-full">{tasks.length} Active Tasks</p>
      </div>

      {/* Main Content Area */}
      {view === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 overflow-x-auto pb-4">
          {STATUSES.map((status) => {
            const col = tasks.filter((t) => t.status === status);
            return (
              <div key={status} className="bg-surface-container-low rounded-[2rem] p-6 min-w-[320px] flex flex-col h-full border border-outline-variant/5">
                <div className="flex items-center justify-between mb-6 px-1">
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined ${statusConfig[status].color}`} style={status === 'Done' ? { fontVariationSettings: "'FILL' 1" } : {}}>
                      {statusConfig[status].icon}
                    </span>
                    <h3 className="font-headline font-extrabold text-on-surface uppercase tracking-wider text-sm">{status}</h3>
                  </div>
                  <span className="bg-white px-2.5 py-0.5 rounded-lg text-[10px] font-black text-on-surface-variant shadow-sm border border-outline-variant/10">{col.length}</span>
                </div>
                <div className="space-y-4 flex-1">
                  {col.length > 0 ? col.map((task) => <TaskCard key={task._id} task={task} />) : (
                    <div className="py-20 text-center border-2 border-dashed border-outline-variant/20 rounded-2xl">
                      <span className="material-symbols-outlined text-outline-variant text-4xl mb-2">inbox</span>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">No Tasks</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl mx-auto">
          {tasks.length > 0 ? tasks.map((task) => <TaskCard key={task._id} task={task} />) : (
            <div className="py-20 text-center bg-surface-container-lowest rounded-[2rem] border border-outline-variant/15">
              <span className="material-symbols-outlined text-outline-variant text-5xl mb-4">task_alt</span>
              <p className="font-bold text-on-surface-variant">All caught up! No tasks found.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setModal(false)}>
          <div className="bg-surface-container-lowest rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl border border-outline-variant/30 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setModal(false)} className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center bg-surface-container hover:bg-surface-container-high rounded-full transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant">close</span>
            </button>
            
            <div className="mb-8">
              <h3 className="font-headline text-2xl font-extrabold text-on-surface">{editingTask ? 'Refine Task' : 'New Strategic Task'}</h3>
              <p className="text-on-surface-variant text-sm mt-1">Define the parameters of your current initiative.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest ml-1">Task Identification</label>
                <input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})}
                  className="w-full px-5 py-4 bg-surface-container-low border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold placeholder:opacity-40" maxLength={100} placeholder="What needs to be accomplished?" />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest ml-1">Contextual Details</label>
                <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})}
                  className="w-full px-5 py-4 bg-surface-container-low border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none resize-none text-sm font-medium h-24 placeholder:opacity-40" maxLength={500} placeholder="Outline any relevant information or sub-tasks..." />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest ml-1">Target Date</label>
                  <input type="date" value={form.dueDate} onChange={(e) => setForm({...form, dueDate: e.target.value})}
                    className="w-full px-5 py-3.5 bg-surface-container-low border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest ml-1">Criticality</label>
                  <select value={form.priority} onChange={(e) => setForm({...form, priority: e.target.value})}
                    className="w-full px-5 py-3.5 bg-surface-container-low border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold appearance-none">
                    {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest ml-1">Current Modality</label>
                <div className="flex gap-2 p-1 bg-surface-container rounded-2xl">
                  {STATUSES.map((s) => (
                    <button key={s} type="button" onClick={() => setForm({...form, status: s})}
                      className={`flex-1 py-3.5 rounded-xl text-xs font-bold transition-all ${form.status === s ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit"
                  className="flex-1 py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 transition-all active:scale-95">
                  {editingTask ? 'Update Strategy' : 'Initialize Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
