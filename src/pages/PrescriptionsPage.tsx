import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge, getStatusType } from '@/components/ui/StatusBadge';
import { PageLoading, ErrorState, EmptyState } from '@/components/ui/States';
import { Modal } from '@/components/ui/Modal';
import { Pill, Plus, Eye, Search, Trash2, Send } from 'lucide-react';
import type { Prescription, Medication } from '@/types';
import { mockPatients } from '@/data/mockData';

export function PrescriptionsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [viewRx, setViewRx] = useState<Prescription | null>(null);
  const [newRx, setNewRx] = useState({ patientId: '', notes: '', medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }] as Medication[] });

  const isDoctor = user?.role === 'doctor';
  const isPharmacy = user?.role === 'pharmacy';

  useEffect(() => { loadPrescriptions(); }, []);

  const loadPrescriptions = async () => {
    setLoading(true); setError(null);
    try { setPrescriptions(await api.getPrescriptions()); } catch { setError('Failed to load prescriptions.'); }
    finally { setLoading(false); }
  };

  if (loading) return <PageLoading label="Loading prescriptions..." />;
  if (error) return <ErrorState message={error} onRetry={loadPrescriptions} />;

  const filtered = prescriptions.filter(rx => {
    const ms = rx.patientName.toLowerCase().includes(search.toLowerCase()) || rx.doctorName.toLowerCase().includes(search.toLowerCase());
    const mf = filter === 'all' || rx.status === filter;
    return ms && mf;
  });

  const handleCreate = async () => {
    if (!newRx.patientId || !newRx.medications[0].name) return;
    const patient = mockPatients.find(p => p.id === newRx.patientId);
    try {
      const created = await api.createPrescription({
        patientId: newRx.patientId, patientName: patient?.name || '',
        doctorId: user?.id || '', doctorName: user?.name || '',
        medications: newRx.medications.filter(m => m.name), notes: newRx.notes,
      });
      setPrescriptions([...prescriptions, created]);
      setShowCreate(false);
      setNewRx({ patientId: '', notes: '', medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }] });
    } catch { setError('Failed to create prescription.'); }
  };

  const updateStatus = async (id: string, status: Prescription['status']) => {
    try {
      await api.updatePrescription(id, { status });
      setPrescriptions(prescriptions.map(rx => rx.id === id ? { ...rx, status } : rx));
      if (viewRx?.id === id) setViewRx({ ...viewRx, status });
    } catch { setError('Failed to update prescription.'); }
  };

  const addMedication = () => setNewRx({ ...newRx, medications: [...newRx.medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }] });
  const removeMedication = (i: number) => setNewRx({ ...newRx, medications: newRx.medications.filter((_, idx) => idx !== i) });
  const updateMedication = (i: number, field: keyof Medication, value: string) => {
    const meds = [...newRx.medications];
    meds[i] = { ...meds[i], [field]: value };
    setNewRx({ ...newRx, medications: meds });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Prescriptions</h1>
          <p className="text-sm text-slate-500 mt-1">{prescriptions.length} prescriptions · {prescriptions.filter(rx => rx.status === 'Pending').length} pending</p>
        </div>
        {isDoctor && (
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Prescription
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search by patient or doctor..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'Sent', 'Pending', 'Processing', 'Completed'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === f ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}>{f === 'all' ? 'All' : f}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Pill} title="No prescriptions found" description="Try adjusting your filters or create a new prescription." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="table-header">Rx ID</th>
                  <th className="table-header">Patient</th>
                  <th className="table-header hidden md:table-cell">Doctor</th>
                  <th className="table-header hidden sm:table-cell">Date</th>
                  <th className="table-header hidden lg:table-cell">Medications</th>
                  <th className="table-header">Status</th>
                  <th className="table-header"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(rx => (
                  <tr key={rx.id} className="table-row-hover">
                    <td className="table-cell font-mono text-xs text-slate-500">{rx.id.toUpperCase()}</td>
                    <td className="table-cell font-medium text-slate-900">{rx.patientName}</td>
                    <td className="table-cell hidden md:table-cell text-slate-500">{rx.doctorName}</td>
                    <td className="table-cell hidden sm:table-cell text-slate-500">{rx.date}</td>
                    <td className="table-cell hidden lg:table-cell text-slate-500">{rx.medications.length} item(s)</td>
                    <td className="table-cell"><StatusBadge type={getStatusType(rx.status)} dot>{rx.status}</StatusBadge></td>
                    <td className="table-cell">
                      <button onClick={() => setViewRx(rx)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Modal */}
      <Modal open={!!viewRx} onClose={() => setViewRx(null)} title={`Prescription ${viewRx?.id.toUpperCase() || ''}`} size="lg">
        {viewRx && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-slate-50"><p className="text-xs text-slate-400">Patient</p><p className="text-sm font-medium text-slate-700">{viewRx.patientName}</p></div>
              <div className="p-3 rounded-lg bg-slate-50"><p className="text-xs text-slate-400">Doctor</p><p className="text-sm font-medium text-slate-700">{viewRx.doctorName}</p></div>
              <div className="p-3 rounded-lg bg-slate-50"><p className="text-xs text-slate-400">Date</p><p className="text-sm font-medium text-slate-700">{viewRx.date}</p></div>
              <div className="p-3 rounded-lg bg-slate-50"><p className="text-xs text-slate-400">Status</p><StatusBadge type={getStatusType(viewRx.status)}>{viewRx.status}</StatusBadge></div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Medications</p>
              <div className="space-y-2">
                {viewRx.medications.map((m, i) => (
                  <div key={i} className="p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Pill className="w-4 h-4 text-purple-500" />
                      <p className="text-sm font-medium text-slate-900">{m.name} {m.dosage}</p>
                    </div>
                    <p className="text-xs text-slate-500">{m.frequency} · {m.duration}</p>
                    {m.instructions && <p className="text-xs text-slate-400 mt-1">Instructions: {m.instructions}</p>}
                  </div>
                ))}
              </div>
            </div>
            {viewRx.notes && <div className="p-3 rounded-lg bg-slate-50"><p className="text-xs text-slate-400">Notes</p><p className="text-sm text-slate-600">{viewRx.notes}</p></div>}
            {isPharmacy && viewRx.status !== 'Completed' && (
              <div className="flex gap-3 pt-2">
                {viewRx.status === 'Sent' && <button onClick={() => updateStatus(viewRx.id, 'Pending')} className="btn-secondary flex-1">Accept</button>}
                {viewRx.status === 'Pending' && <button onClick={() => updateStatus(viewRx.id, 'Processing')} className="btn-secondary flex-1">Start Processing</button>}
                {viewRx.status === 'Processing' && <button onClick={() => updateStatus(viewRx.id, 'Completed')} className="btn-primary flex-1 flex items-center justify-center gap-2"><Send className="w-4 h-4" /> Mark Completed</button>}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Prescription" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Patient *</label>
            <select value={newRx.patientId} onChange={(e) => setNewRx({ ...newRx, patientId: e.target.value })} className="input-field">
              <option value="">Select patient...</option>
              {mockPatients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">Medications</label>
              <button onClick={addMedication} className="text-xs text-brand-600 font-medium hover:text-brand-700 flex items-center gap-1"><Plus className="w-3 h-3" /> Add medication</button>
            </div>
            <div className="space-y-3">
              {newRx.medications.map((m, i) => (
                <div key={i} className="p-3 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Medication {i + 1}</span>
                    {newRx.medications.length > 1 && <button onClick={() => removeMedication(i)} className="text-rose-400 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input placeholder="Name *" value={m.name} onChange={(e) => updateMedication(i, 'name', e.target.value)} className="input-field text-sm" />
                    <input placeholder="Dosage" value={m.dosage} onChange={(e) => updateMedication(i, 'dosage', e.target.value)} className="input-field text-sm" />
                    <input placeholder="Frequency" value={m.frequency} onChange={(e) => updateMedication(i, 'frequency', e.target.value)} className="input-field text-sm" />
                    <input placeholder="Duration" value={m.duration} onChange={(e) => updateMedication(i, 'duration', e.target.value)} className="input-field text-sm" />
                  </div>
                  <input placeholder="Instructions" value={m.instructions} onChange={(e) => updateMedication(i, 'instructions', e.target.value)} className="input-field text-sm" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
            <textarea value={newRx.notes} onChange={(e) => setNewRx({ ...newRx, notes: e.target.value })} className="input-field" rows={2} placeholder="Additional notes for pharmacy..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleCreate} className="btn-primary flex items-center gap-2"><Send className="w-4 h-4" /> Send to Pharmacy</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
