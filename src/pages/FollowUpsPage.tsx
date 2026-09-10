import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge, getStatusType } from '@/components/ui/StatusBadge';
import { PageLoading, ErrorState, EmptyState } from '@/components/ui/States';
import { Modal } from '@/components/ui/Modal';
import { ClipboardList, Plus, Brain, CheckCircle2, XCircle, Calendar } from 'lucide-react';
import type { FollowUp } from '@/types';
import { mockPatients } from '@/data/mockData';

export function FollowUpsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newFollowUp, setNewFollowUp] = useState({ patientId: '', reason: '' });

  const isDoctor = user?.role === 'doctor';

  useEffect(() => { loadFollowUps(); }, []);

  const loadFollowUps = async () => {
    setLoading(true); setError(null);
    try { setFollowUps(await api.getFollowUps()); } catch { setError('Failed to load follow-ups.'); }
    finally { setLoading(false); }
  };

  if (loading) return <PageLoading label="Loading follow-ups..." />;
  if (error) return <ErrorState message={error} onRetry={loadFollowUps} />;

  const handleCreate = async () => {
    if (!newFollowUp.patientId || !newFollowUp.reason) return;
    const patient = mockPatients.find(p => p.id === newFollowUp.patientId);
    try {
      const created = await api.createFollowUp({
        patientId: newFollowUp.patientId, patientName: patient?.name || '',
        doctorId: user?.id || '', doctorName: user?.name || '', reason: newFollowUp.reason,
      });
      setFollowUps([...followUps, created]);
      setShowCreate(false);
      setNewFollowUp({ patientId: '', reason: '' });
    } catch { setError('Failed to create follow-up.'); }
  };

  const handleApprove = (id: string) => setFollowUps(followUps.map(f => f.id === id ? { ...f, status: 'Approved' } : f));
  const handleReject = (id: string) => setFollowUps(followUps.map(f => f.id === id ? { ...f, status: 'Rejected' } : f));

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Follow-ups</h1>
          <p className="text-sm text-slate-500 mt-1">{followUps.length} follow-ups · {followUps.filter(f => f.status === 'Awaiting Approval').length} awaiting approval</p>
        </div>
        {isDoctor && (
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Request Follow-up
          </button>
        )}
      </div>

      {followUps.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No follow-ups" description="Request a follow-up to get started." />
      ) : (
        <div className="space-y-3">
          {followUps.map(f => (
            <div key={f.id} className="card card-hover p-4">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  f.aiSuggestion ? 'bg-violet-50 text-violet-600' : 'bg-brand-50 text-brand-600'
                }`}>
                  {f.aiSuggestion ? <Brain className="w-4 h-4" /> : <ClipboardList className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-slate-900">{f.patientName}</p>
                    {f.aiSuggestion && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-violet-50 text-violet-600 border border-violet-100">AI Suggested</span>}
                  </div>
                  <p className="text-sm text-slate-600 mt-0.5">{f.reason}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 flex-wrap">
                    <span>{f.doctorName}</span>
                    <span>·</span>
                    <span>Requested: {f.requestedDate}</span>
                    {f.suggestedDate && (<><span>·</span><span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Suggested: {f.suggestedDate} at {f.suggestedTime}</span></>)}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <StatusBadge type={getStatusType(f.status)} dot>{f.status}</StatusBadge>
                  {f.status === 'Awaiting Approval' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleApprove(f.id)} className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Approve
                      </button>
                      <button onClick={() => handleReject(f.id)} className="text-xs px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Request Follow-up" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Patient *</label>
            <select value={newFollowUp.patientId} onChange={(e) => setNewFollowUp({ ...newFollowUp, patientId: e.target.value })} className="input-field">
              <option value="">Select patient...</option>
              {mockPatients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason *</label>
            <textarea value={newFollowUp.reason} onChange={(e) => setNewFollowUp({ ...newFollowUp, reason: e.target.value })} className="input-field" rows={3} placeholder="Reason for follow-up..." />
          </div>
          <div className="p-3 rounded-lg bg-violet-50 border border-violet-100">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-4 h-4 text-violet-600" />
              <span className="text-xs font-semibold text-violet-700">AI Workflow Agent</span>
            </div>
            <p className="text-xs text-slate-600">After submission, the AI agent will check appointment availability and suggest a suitable time slot. Human approval will be required before the appointment is created.</p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleCreate} className="btn-primary">Request Follow-up</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
