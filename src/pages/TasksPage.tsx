import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge, getStatusType } from '@/components/ui/StatusBadge';
import { PageLoading, ErrorState, EmptyState } from '@/components/ui/States';
import { Modal } from '@/components/ui/Modal';
import { ListChecks, Brain, Plus, Search, CheckCircle2, Clock } from 'lucide-react';
import type { Task } from '@/types';
import { mockPatients } from '@/data/mockData';

export function TasksPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', patientId: '', priority: 'Medium', dueDate: '' });

  const canCreate = user?.role === 'doctor' || user?.role === 'admin';

  useEffect(() => { loadTasks(); }, []);

  const loadTasks = async () => {
    setLoading(true); setError(null);
    try { setTasks(await api.getTasks()); } catch { setError('Failed to load tasks.'); }
    finally { setLoading(false); }
  };

  if (loading) return <PageLoading label="Loading tasks..." />;
  if (error) return <ErrorState message={error} onRetry={loadTasks} />;

  const filtered = tasks.filter(t => {
    const ms = t.title.toLowerCase().includes(search.toLowerCase()) || t.patientName.toLowerCase().includes(search.toLowerCase());
    const mf = filter === 'all' || t.status === filter || (filter === 'urgent' && t.priority === 'Urgent');
    return ms && mf;
  });

  const handleCreate = async () => {
    if (!newTask.title || !newTask.patientId) return;
    const patient = mockPatients.find(p => p.id === newTask.patientId);
    try {
      const created = await api.createTask({
        title: newTask.title, patientId: newTask.patientId, patientName: patient?.name || '',
        assignedTo: user?.name || '', assignedToId: user?.id || '', department: user?.department || '',
        priority: newTask.priority as Task['priority'], dueDate: newTask.dueDate,
      });
      setTasks([...tasks, created]);
      setShowCreate(false);
      setNewTask({ title: '', patientId: '', priority: 'Medium', dueDate: '' });
    } catch { setError('Failed to create task.'); }
  };

  const handleStatusChange = async (id: string, status: Task['status']) => {
    try {
      await api.updateTask(id, { status });
      setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
    } catch { setError('Failed to update task.'); }
  };

  const priorityColors: Record<string, string> = {
    Urgent: 'bg-rose-50 text-rose-700 border-rose-200',
    High: 'bg-amber-50 text-amber-700 border-amber-200',
    Medium: 'bg-blue-50 text-blue-700 border-blue-200',
    Low: 'bg-slate-50 text-slate-600 border-slate-200',
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
          <p className="text-sm text-slate-500 mt-1">{tasks.length} tasks · {tasks.filter(t => t.status === 'Needs Review' || t.status === 'Needs Approval').length} need attention</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Task
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'Pending', 'In Progress', 'Needs Review', 'Needs Approval', 'Completed', 'urgent'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                filter === f ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}>
              {f === 'all' ? 'All' : f === 'urgent' ? 'Urgent' : f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ListChecks} title="No tasks found" description="Try adjusting your filters or create a new task." />
      ) : (
        <div className="space-y-3">
          {filtered.map(task => (
            <div key={task.id} className="card card-hover p-4">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  task.aiGenerated ? 'bg-violet-50 text-violet-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  {task.aiGenerated ? <Brain className="w-4 h-4" /> : <ListChecks className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                    {task.aiGenerated && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-violet-50 text-violet-600 border border-violet-100">AI Generated</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                    <span>{task.patientName}</span>
                    <span>·</span>
                    <span>{task.assignedTo}</span>
                    <span>·</span>
                    <span>{task.department}</span>
                    <span>·</span>
                    <span>Due: {task.dueDate}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${priorityColors[task.priority]}`}>{task.priority}</span>
                  <StatusBadge type={getStatusType(task.status)} dot>{task.status}</StatusBadge>
                </div>
              </div>
              {task.status !== 'Completed' && (
                <div className="flex gap-2 mt-3 pl-12">
                  {task.status === 'Pending' && (
                    <button onClick={() => handleStatusChange(task.id, 'In Progress')} className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Start
                    </button>
                  )}
                  {task.status === 'In Progress' && (
                    <button onClick={() => handleStatusChange(task.id, 'Completed')} className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Complete
                    </button>
                  )}
                  {task.status === 'Needs Approval' && (
                    <button onClick={() => handleStatusChange(task.id, 'Completed')} className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Approve
                    </button>
                  )}
                  {task.status === 'Needs Review' && (
                    <button onClick={() => handleStatusChange(task.id, 'Completed')} className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Mark Reviewed
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create New Task" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Task Title *</label>
            <input value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} className="input-field" placeholder="e.g. Review CBC report" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Patient *</label>
            <select value={newTask.patientId} onChange={(e) => setNewTask({ ...newTask, patientId: e.target.value })} className="input-field">
              <option value="">Select patient...</option>
              {mockPatients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
              <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })} className="input-field">
                <option>Low</option><option>Medium</option><option>High</option><option>Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Due Date</label>
              <input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleCreate} className="btn-primary">Create Task</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
