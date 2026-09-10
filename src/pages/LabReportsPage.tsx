import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge, getStatusType } from '@/components/ui/StatusBadge';
import { SectionCard, AIBadge } from '@/components/ui/KPICard';
import { PageLoading, ErrorState, EmptyState } from '@/components/ui/States';
import { FlaskConical, Brain, Upload, Eye, Search } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { LabReport } from '@/types';

export function LabReportsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<LabReport[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [viewReport, setViewReport] = useState<LabReport | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getLabReports();
      setReports(data);
    } catch {
      setError('Failed to load lab reports.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoading label="Loading lab reports..." />;
  if (error) return <ErrorState message={error} onRetry={loadReports} />;

  const filtered = reports.filter(r => {
    const matchesSearch = r.patientName.toLowerCase().includes(search.toLowerCase()) || r.testType.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || r.status === filter;
    return matchesSearch && matchesFilter;
  });

  const isLabStaff = user?.role === 'lab';

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Lab Reports</h1>
        <p className="text-sm text-slate-500 mt-1">{reports.length} lab reports · {reports.filter(r => r.status === 'Needs Review').length} need review</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient or test type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'Pending', 'In Progress', 'Completed', 'Needs Review'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === f ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={FlaskConical} title="No lab reports found" description="Try adjusting your search or filters." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="table-header">Test Type</th>
                  <th className="table-header">Patient</th>
                  <th className="table-header hidden md:table-cell">Requested By</th>
                  <th className="table-header hidden sm:table-cell">Date Requested</th>
                  <th className="table-header hidden lg:table-cell">Report Date</th>
                  <th className="table-header">Status</th>
                  <th className="table-header"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(r => (
                  <tr key={r.id} className="table-row-hover">
                    <td className="table-cell">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                          <FlaskConical className="w-4 h-4 text-amber-600" />
                        </div>
                        <span className="font-medium text-slate-900">{r.testType}</span>
                      </div>
                    </td>
                    <td className="table-cell text-slate-600">{r.patientName}</td>
                    <td className="table-cell hidden md:table-cell text-slate-500">{r.requestedBy}</td>
                    <td className="table-cell hidden sm:table-cell text-slate-500">{r.dateRequested}</td>
                    <td className="table-cell hidden lg:table-cell text-slate-500">{r.reportDate || '—'}</td>
                    <td className="table-cell"><StatusBadge type={getStatusType(r.status)} dot>{r.status}</StatusBadge></td>
                    <td className="table-cell">
                      <button onClick={() => setViewReport(r)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
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

      {/* View Report Modal */}
      <Modal open={!!viewReport} onClose={() => setViewReport(null)} title={viewReport?.testType || 'Lab Report'} size="lg">
        {viewReport && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-slate-50">
                <p className="text-xs text-slate-400">Patient</p>
                <p className="text-sm font-medium text-slate-700">{viewReport.patientName}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50">
                <p className="text-xs text-slate-400">Requested By</p>
                <p className="text-sm font-medium text-slate-700">{viewReport.requestedBy}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50">
                <p className="text-xs text-slate-400">Date Requested</p>
                <p className="text-sm font-medium text-slate-700">{viewReport.dateRequested}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50">
                <p className="text-xs text-slate-400">Report Date</p>
                <p className="text-sm font-medium text-slate-700">{viewReport.reportDate || 'Pending'}</p>
              </div>
            </div>

            {viewReport.result && (
              <div className="p-4 rounded-lg border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Results</p>
                <p className="text-sm text-slate-700">{viewReport.result}</p>
              </div>
            )}

            {viewReport.aiSummary && (
              <div className="p-4 rounded-lg bg-violet-50 border border-violet-100">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-violet-600" />
                  <span className="text-sm font-semibold text-violet-700">AI Workflow Summary</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{viewReport.aiSummary}</p>
                <div className="mt-3">
                  <AIBadge />
                </div>
              </div>
            )}

            {isLabStaff && viewReport.status === 'Pending' && (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setReports(reports.map(r => r.id === viewReport.id ? { ...r, status: 'In Progress' } : r));
                    setViewReport({ ...viewReport, status: 'In Progress' });
                  }}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  Start Processing
                </button>
                <button
                  onClick={() => {
                    setReports(reports.map(r => r.id === viewReport.id ? { ...r, status: 'Completed', reportDate: new Date().toISOString().split('T')[0], uploadedBy: user?.name } : r));
                    setViewReport({ ...viewReport, status: 'Completed', reportDate: new Date().toISOString().split('T')[0] });
                  }}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" /> Upload Report
                </button>
              </div>
            )}

            {isLabStaff && viewReport.status === 'In Progress' && (
              <button
                onClick={() => {
                  setReports(reports.map(r => r.id === viewReport.id ? { ...r, status: 'Completed', reportDate: new Date().toISOString().split('T')[0], uploadedBy: user?.name } : r));
                  setViewReport({ ...viewReport, status: 'Completed', reportDate: new Date().toISOString().split('T')[0] });
                }}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" /> Mark as Completed
              </button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
