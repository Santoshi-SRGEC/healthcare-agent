import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge, getStatusType } from '@/components/ui/StatusBadge';
import { SectionCard, AIBadge } from '@/components/ui/KPICard';
import { PageLoading, ErrorState, EmptyState } from '@/components/ui/States';
import { Modal } from '@/components/ui/Modal';
import {
  Brain, Activity, CheckCircle2, Circle, Clock, AlertCircle,
  Wrench, Shield, Play, CheckCircle, XCircle, Zap, ArrowRight,
  User, FileText, FlaskConical, Bell, Calendar, ListChecks
} from 'lucide-react';
import type { AIWorkflow, Patient } from '@/types';

export function AIWorkflowPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workflows, setWorkflows] = useState<AIWorkflow[]>([]);
  const [selectedWf, setSelectedWf] = useState<AIWorkflow | null>(null);
  const [showRunModal, setShowRunModal] = useState(false);
  const [running, setRunning] = useState(false);
  const [runPatient, setRunPatient] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [wfData, patientData] = await Promise.all([
        api.getAIWorkflows(),
        api.getPatients(),
      ]);
      setWorkflows(wfData);
      if (wfData.length > 0) setSelectedWf(wfData[0]);
      setPatients(patientData);
    } catch {
      setError('Failed to load AI workflows.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoading label="Loading AI workflows..." />;
  if (error) return <ErrorState message={error} onRetry={loadAll} />;

  const pendingApprovals = workflows.filter((w) => w.approvalStatus === 'pending');

  const handleApprove = async (id: string) => {
    // Optimistic update
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              approvalStatus: 'approved',
              status: 'Completed',
              steps: w.steps.map((s) =>
                s.status === 'awaiting_approval' ? { ...s, status: 'completed' } : s
              ),
            }
          : w
      )
    );
    if (selectedWf?.id === id) {
      setSelectedWf({
        ...selectedWf,
        approvalStatus: 'approved',
        status: 'Completed',
        steps: selectedWf.steps.map((s) =>
          s.status === 'awaiting_approval' ? { ...s, status: 'completed' } : s
        ),
      });
    }
  };

  const handleReject = (id: string) => {
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, approvalStatus: 'rejected', status: 'Failed' } : w
      )
    );
    if (selectedWf?.id === id) {
      setSelectedWf({ ...selectedWf, approvalStatus: 'rejected', status: 'Failed' });
    }
  };

  const handleRun = async () => {
    if (!runPatient) return;
    setRunning(true);
    setError(null);
    try {
      const wf = await api.runAIWorkflow(runPatient);
      setWorkflows([wf, ...workflows]);
      setSelectedWf(wf);
      setShowRunModal(false);
      setRunPatient('');
    } catch (err: any) {
      console.error('AI run failed:', err);
      setError(err?.message || 'Failed to run workflow.');
    } finally {
      setRunning(false);
    }
  };

  const stepIcons: Record<string, typeof CheckCircle2> = {
    completed: CheckCircle2,
    in_progress: Clock,
    pending: Circle,
    awaiting_approval: AlertCircle,
  };

  const stepColors: Record<string, string> = {
    completed: 'bg-emerald-500 text-white',
    in_progress: 'bg-blue-500 text-white animate-pulse',
    pending: 'bg-slate-200 text-slate-400',
    awaiting_approval: 'bg-amber-500 text-white animate-pulse',
  };

  const tools = [
    { name: 'get_patient()', icon: User, desc: 'Retrieve patient context', allowed: true },
    { name: 'get_appointments()', icon: Calendar, desc: 'Check appointment availability', allowed: true },
    { name: 'get_lab_reports()', icon: FlaskConical, desc: 'Retrieve lab report data', allowed: true },
    { name: 'get_documents()', icon: FileText, desc: 'Retrieve document content', allowed: true },
    { name: 'create_task()', icon: ListChecks, desc: 'Create workflow tasks', allowed: true },
    { name: 'create_appointment()', icon: Calendar, desc: 'Suggest new appointments', allowed: true },
    { name: 'send_notification()', icon: Bell, desc: 'Notify staff members', allowed: true },
  ];

  const cannotDo = [
    'Diagnose',
    'Prescribe independently',
    'Make clinical decisions',
    'Delete patient records',
    'Change permissions',
    'Perform unauthorized actions',
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            AI Workflow Agent
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Intelligent workflow coordination with human-in-the-loop approval
          </p>
        </div>
        {user?.role === 'doctor' && (
          <button onClick={() => setShowRunModal(true)} className="btn-primary flex items-center gap-2">
            <Play className="w-4 h-4" /> Run Workflow
          </button>
        )}
      </div>

      {/* Error banner (inline) */}
      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-800 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-800">✕</button>
        </div>
      )}

      {/* Agent Status Banner */}
      <div className="card p-5 bg-gradient-to-r from-violet-50 via-white to-teal-50 border-violet-100">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-teal-500 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">CareFlow Agent</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitoring workflow events · {pendingApprovals.length} actions awaiting human approval
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{workflows.length}</p>
              <p className="text-xs text-slate-500">Total Workflows</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">{pendingApprovals.length}</p>
              <p className="text-xs text-slate-500">Awaiting Approval</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">
                {workflows.filter((w) => w.status === 'Completed').length}
              </p>
              <p className="text-xs text-slate-500">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Approvals */}
      {pendingApprovals.length > 0 && (
        <div className="card p-5 border-amber-200 bg-amber-50/50">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-semibold text-amber-800">Human Approval Required</h3>
          </div>
          <div className="space-y-3">
            {pendingApprovals.map((wf) => (
              <div key={wf.id} className="flex items-start gap-3 p-3 rounded-lg bg-white border border-amber-100">
                <Brain className="w-5 h-5 text-violet-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{wf.trigger}</p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{wf.suggestion}</p>
                  <div className="mt-1.5"><AIBadge /></div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleApprove(wf.id)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => handleReject(wf.id)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 transition-colors flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Workflow List */}
        <div className="lg:col-span-1">
          <SectionCard title="Workflow Instances">
            {workflows.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">
                No workflows yet. Click "Run Workflow" to start one.
              </p>
            ) : (
              <div className="space-y-2">
                {workflows.map((wf) => (
                  <button
                    key={wf.id}
                    onClick={() => setSelectedWf(wf)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedWf?.id === wf.id ? 'border-brand-300 bg-brand-50' : 'border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
                      <p className="text-xs font-medium text-slate-700 truncate">{wf.patientName}</p>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{wf.trigger}</p>
                    <div className="flex items-center justify-between mt-2">
                      <StatusBadge type={getStatusType(wf.status)}>{wf.status}</StatusBadge>
                      <span className="text-[10px] text-slate-400">{wf.createdAt}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Selected Workflow Detail */}
        <div className="lg:col-span-2 space-y-5">
          {selectedWf ? (
            <>
              <SectionCard title="Current Workflow">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <p className="text-sm font-medium text-slate-700">Trigger</p>
                  </div>
                  <p className="text-sm text-slate-600">{selectedWf.trigger}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Patient: {selectedWf.patientName} · Created: {selectedWf.createdAt}
                  </p>
                </div>
                <div className="relative">
                  {selectedWf.steps.map((step, i) => {
                    const Icon = stepIcons[step.status] || Circle;
                    const isLast = i === selectedWf.steps.length - 1;
                    return (
                      <div key={step.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${stepColors[step.status] || stepColors.pending}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          {!isLast && <div className="w-0.5 h-8 bg-slate-200" />}
                        </div>
                        <div className="pt-1 pb-2">
                          <p className={`text-sm font-medium ${step.status === 'awaiting_approval' ? 'text-amber-700' : 'text-slate-700'}`}>
                            {step.step}. {step.action}
                          </p>
                          {step.tool && <p className="text-xs text-violet-500 font-mono mt-0.5">{step.tool}</p>}
                          {step.timestamp && <p className="text-[10px] text-slate-400 mt-0.5">{step.timestamp}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {selectedWf.suggestion && selectedWf.approvalStatus === 'pending' && (
                  <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-semibold text-amber-800">Human Approval Required</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{selectedWf.suggestion}</p>
                    <AIBadge />
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleApprove(selectedWf.id)}
                        className="text-sm px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(selectedWf.id)}
                        className="text-sm px-4 py-2 rounded-lg bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 transition-colors flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>
                )}
              </SectionCard>

              {/* AI Summary if present */}
              {selectedWf.suggestion && (
                <SectionCard title="AI Summary">
                  <div className="p-4 rounded-lg bg-violet-50 border border-violet-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-4 h-4 text-violet-600" />
                      <span className="text-sm font-semibold text-violet-700">AI Generated</span>
                      <AIBadge />
                    </div>
                    <pre className="whitespace-pre-wrap text-xs text-slate-700 font-sans">
                      {selectedWf.suggestion}
                    </pre>
                    <p className="text-[11px] text-slate-500 mt-3 italic">
                      ⚠️ This is AI-generated workflow information, not a diagnosis. Verify against the original document.
                    </p>
                  </div>
                </SectionCard>
              )}

              {/* Agent Activity Table */}
              {selectedWf.agentActivity && selectedWf.agentActivity.length > 0 && (
                <SectionCard title="Agent Activity">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="table-header">Agent</th>
                          <th className="table-header hidden md:table-cell">Tool</th>
                          <th className="table-header">Action</th>
                          <th className="table-header hidden sm:table-cell">Result</th>
                          <th className="table-header">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedWf.agentActivity.map((aa) => (
                          <tr key={aa.id} className="hover:bg-slate-50 transition-colors">
                            <td className="table-cell">
                              <div className="flex items-center gap-1.5">
                                <Brain className="w-3 h-3 text-violet-500" />
                                <span className="text-xs font-medium text-slate-700">{aa.agent}</span>
                              </div>
                            </td>
                            <td className="table-cell hidden md:table-cell">
                              <code className="text-xs text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded">{aa.tool}</code>
                            </td>
                            <td className="table-cell text-xs text-slate-600">{aa.action}</td>
                            <td className="table-cell hidden sm:table-cell text-xs text-slate-500">{aa.result}</td>
                            <td className="table-cell">
                              <StatusBadge type={aa.status === 'Success' ? 'success' : 'warning'}>
                                {aa.status}
                              </StatusBadge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </SectionCard>
              )}
            </>
          ) : (
            <EmptyState
              icon={Brain}
              title="Select a workflow"
              description="Choose a workflow from the list to view its details, or run a new one."
            />
          )}
        </div>
      </div>

      {/* Controlled Tools & AI Safety */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="Controlled Tools">
          <p className="text-xs text-slate-500 mb-3">
            The AI agent can only call these approved tools with validated parameters.
          </p>
          <div className="space-y-2">
            {tools.map((t) => (
              <div
                key={t.name}
                className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                  <t.icon className="w-4 h-4 text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono font-medium text-slate-700">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.desc}</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="AI Safety Boundaries">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-semibold text-emerald-700">AI Can</span>
              </div>
              <div className="space-y-1.5 pl-6">
                {[
                  'Summarize documents',
                  'Understand workflow context',
                  'Identify pending actions',
                  'Create workflow tasks',
                  'Suggest appointments',
                  'Send notifications',
                ].map((item) => (
                  <p key={item} className="text-xs text-slate-600 flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-emerald-400" /> {item}
                  </p>
                ))}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-rose-500" />
                <span className="text-sm font-semibold text-rose-700">AI Cannot</span>
              </div>
              <div className="space-y-1.5 pl-6">
                {cannotDo.map((item) => (
                  <p key={item} className="text-xs text-slate-600 flex items-center gap-2">
                    <XCircle className="w-3 h-3 text-rose-400" /> {item}
                  </p>
                ))}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-violet-50 border border-violet-100">
              <div className="flex items-center gap-2 mb-1">
                <Wrench className="w-3.5 h-3.5 text-violet-600" />
                <span className="text-xs font-semibold text-violet-700">Production-Ready Design</span>
              </div>
              <p className="text-xs text-slate-600">
                Tool parameters are validated. Agent respects user role permissions. All actions are logged to audit trail.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Run Workflow Modal */}
      <Modal open={showRunModal} onClose={() => setShowRunModal(false)} title="Run AI Workflow" size="md">
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-violet-50 border border-violet-100">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-4 h-4 text-violet-600" />
              <span className="text-sm font-semibold text-violet-700">CareFlow Agent</span>
            </div>
            <p className="text-xs text-slate-600">
              The agent will retrieve patient context, review lab reports, and generate a workflow summary. All clinical decisions require doctor approval.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Select Patient
            </label>
            <select
              value={runPatient}
              onChange={(e) => setRunPatient(e.target.value)}
              className="input-field"
            >
              <option value="">Select patient...</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (ID: {p.id})
                </option>
              ))}
            </select>
            {patients.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                No patients available. Your role may not have access to the patient list.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowRunModal(false)} className="btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleRun}
              disabled={running || !runPatient}
              className="btn-primary flex items-center gap-2"
            >
              {running ? (
                <>
                  <Activity className="w-4 h-4 animate-pulse" /> Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> Run Workflow
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}