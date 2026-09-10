import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { SectionCard } from '@/components/ui/KPICard';
import { StatusBadge, getStatusType } from '@/components/ui/StatusBadge';
import { PageLoading, ErrorState } from '@/components/ui/States';
import {
  ArrowLeft, Phone, Mail, MapPin, Calendar, User as UserIcon,
  Heart, FileText, FlaskConical, Pill, ClipboardList, ListChecks,
  CheckCircle2, Circle, Clock, AlertCircle, Brain
} from 'lucide-react';
import type { Patient, Appointment, Document, LabReport, Task, Prescription, FollowUp, WorkflowTimelineItem } from '@/types';
import { mockAppointments, mockDocuments, mockLabReports, mockTasks, mockPrescriptions, mockFollowUps } from '@/data/mockData';

export function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);

  useEffect(() => {
    if (!id) return;
    loadPatient(id);
  }, [id]);

  const loadPatient = async (patientId: string) => {
    setLoading(true);
    setError(null);
    try {
      const p = await api.getPatient(patientId);
      if (!p) {
        setError('Patient not found.');
        return;
      }
      setPatient(p);
      setAppointments(mockAppointments.filter(a => a.patientId === patientId));
      setDocuments(mockDocuments.filter(d => d.patientId === patientId));
      setLabReports(mockLabReports.filter(r => r.patientId === patientId));
      setTasks(mockTasks.filter(t => t.patientId === patientId));
      setPrescriptions(mockPrescriptions.filter(rx => rx.patientId === patientId));
      setFollowUps(mockFollowUps.filter(f => f.patientId === patientId));
    } catch {
      setError('Failed to load patient details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoading label="Loading patient details..." />;
  if (error) return <ErrorState message={error} onRetry={() => id && loadPatient(id)} />;
  if (!patient) return null;

  const timeline: WorkflowTimelineItem[] = [
    { id: 'tl1', step: 'Patient Registered', label: patient.registeredDate, status: 'Completed', actor: 'Reception' },
    { id: 'tl2', step: 'Appointment', label: appointments[0]?.date || '—', status: appointments.length > 0 ? 'Completed' : 'Pending', actor: 'Reception' },
    { id: 'tl3', step: 'Doctor Consultation', label: appointments.find(a => a.status === 'Completed')?.date || '—', status: appointments.find(a => a.status === 'Completed') ? 'Completed' : 'Pending', actor: 'Doctor' },
    { id: 'tl4', step: 'Lab Test Requested', label: labReports.length > 0 ? labReports[0].dateRequested : '—', status: labReports.length > 0 ? 'Completed' : 'Pending', actor: 'Doctor' },
    { id: 'tl5', step: 'Lab Report Uploaded', label: labReports.find(r => r.status === 'Completed')?.reportDate || '—', status: labReports.find(r => r.status === 'Completed') ? 'Completed' : labReports.length > 0 ? 'In Progress' : 'Pending', actor: 'Lab Staff' },
    { id: 'tl6', step: 'Doctor Review', label: labReports.find(r => r.status === 'Needs Review') ? 'Pending' : '—', status: labReports.find(r => r.status === 'Needs Review') ? 'Needs Review' : labReports.find(r => r.status === 'Completed') ? 'Completed' : 'Pending', actor: 'Doctor' },
    { id: 'tl7', step: 'Prescription', label: prescriptions.length > 0 ? prescriptions[0].date : '—', status: prescriptions.length > 0 ? 'Completed' : 'Pending', actor: 'Doctor' },
    { id: 'tl8', step: 'Follow-up', label: followUps[0]?.requestedDate || '—', status: followUps.length > 0 ? (followUps[0].status === 'Approved' ? 'Completed' : 'Awaiting Approval') : 'Pending', actor: followUps[0]?.aiSuggestion ? 'AI + Doctor' : 'Doctor' },
  ];

  const timelineIcons: Record<string, typeof CheckCircle2> = {
    'Completed': CheckCircle2,
    'In Progress': Clock,
    'Pending': Circle,
    'Needs Review': AlertCircle,
    'Awaiting Approval': Clock,
  };

  const timelineColors: Record<string, string> = {
    'Completed': 'bg-emerald-500 text-white',
    'In Progress': 'bg-blue-500 text-white',
    'Pending': 'bg-slate-200 text-slate-400',
    'Needs Review': 'bg-amber-500 text-white',
    'Awaiting Approval': 'bg-amber-500 text-white',
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <button onClick={() => navigate('/patients')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Patients
      </button>

      {/* Patient Overview */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-teal-500 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
            {patient.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
              <StatusBadge type={getStatusType(patient.status)} dot>{patient.status}</StatusBadge>
            </div>
            <p className="text-sm text-slate-500 mt-1 font-mono">{patient.id.toUpperCase()}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
              <InfoItem icon={UserIcon} label="Age / Gender" value={`${patient.age} / ${patient.gender}`} />
              <InfoItem icon={Phone} label="Contact" value={patient.contact} />
              <InfoItem icon={Mail} label="Email" value={patient.email || '—'} />
              <InfoItem icon={Heart} label="Blood Group" value={patient.bloodGroup || '—'} />
              <InfoItem icon={Phone} label="Emergency" value={patient.emergencyContact} />
              <InfoItem icon={MapPin} label="Address" value={patient.address || '—'} />
              <InfoItem icon={Calendar} label="Registered" value={patient.registeredDate} />
              <InfoItem icon={Calendar} label="Last Visit" value={patient.lastVisit || '—'} />
            </div>
            {patient.conditions && patient.conditions.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Known Conditions</p>
                <div className="flex flex-wrap gap-2">
                  {patient.conditions.map(c => (
                    <span key={c} className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium border border-rose-100">{c}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Workflow Timeline */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Patient Workflow Timeline</h3>
        <div className="relative">
          {timeline.map((item, i) => {
            const Icon = timelineIcons[item.status] || Circle;
            const isLast = i === timeline.length - 1;
            return (
              <div key={item.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${timelineColors[item.status]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {!isLast && <div className="w-0.5 h-12 bg-slate-200" />}
                </div>
                <div className="pt-1.5 pb-8">
                  <p className="text-sm font-medium text-slate-900">{item.step}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge type={getStatusType(item.status)}>{item.status}</StatusBadge>
                    {item.actor && <span className="text-xs text-slate-400">· {item.actor}</span>}
                  </div>
                  {item.label !== '—' && <p className="text-xs text-slate-500 mt-1">{item.label}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Appointments, Lab Reports, Documents, Tasks, Prescriptions, Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="Upcoming Appointment">
          {appointments.filter(a => a.status === 'Confirmed' || a.status === 'Pending').length > 0 ? (
            <div className="space-y-2">
              {appointments.filter(a => a.status === 'Confirmed' || a.status === 'Pending').map(a => (
                <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100">
                  <Calendar className="w-4 h-4 text-brand-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">{a.date} at {a.time}</p>
                    <p className="text-xs text-slate-500">{a.doctorName} · {a.department}</p>
                  </div>
                  <StatusBadge type={getStatusType(a.status)}>{a.status}</StatusBadge>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-slate-500 text-center py-4">No upcoming appointments.</p>}
        </SectionCard>

        <SectionCard title="Previous Appointments">
          {appointments.filter(a => a.status === 'Completed').length > 0 ? (
            <div className="space-y-2">
              {appointments.filter(a => a.status === 'Completed').map(a => (
                <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">{a.date} at {a.time}</p>
                    <p className="text-xs text-slate-500">{a.doctorName} · {a.reason}</p>
                  </div>
                  <StatusBadge type="success">{a.status}</StatusBadge>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-slate-500 text-center py-4">No previous appointments.</p>}
        </SectionCard>

        <SectionCard title="Lab Reports">
          {labReports.length > 0 ? (
            <div className="space-y-2">
              {labReports.map(r => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100">
                  <FlaskConical className="w-4 h-4 text-amber-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{r.testType}</p>
                    <p className="text-xs text-slate-500">Requested: {r.dateRequested}</p>
                  </div>
                  <StatusBadge type={getStatusType(r.status)}>{r.status}</StatusBadge>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-slate-500 text-center py-4">No lab reports.</p>}
        </SectionCard>

        <SectionCard title="Documents">
          {documents.length > 0 ? (
            <div className="space-y-2">
              {documents.map(d => (
                <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{d.name}</p>
                    <p className="text-xs text-slate-500">{d.date} · {d.uploadedBy}</p>
                  </div>
                  <StatusBadge type={getStatusType(d.status)}>{d.status}</StatusBadge>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-slate-500 text-center py-4">No documents.</p>}
        </SectionCard>

        <SectionCard title="Tasks">
          {tasks.length > 0 ? (
            <div className="space-y-2">
              {tasks.map(t => (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100">
                  {t.aiGenerated ? <Brain className="w-4 h-4 text-violet-500" /> : <ListChecks className="w-4 h-4 text-slate-400" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{t.title}</p>
                    <p className="text-xs text-slate-500">{t.assignedTo} · Due: {t.dueDate}</p>
                  </div>
                  <StatusBadge type={getStatusType(t.status)}>{t.status}</StatusBadge>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-slate-500 text-center py-4">No tasks.</p>}
        </SectionCard>

        <SectionCard title="Prescriptions">
          {prescriptions.length > 0 ? (
            <div className="space-y-2">
              {prescriptions.map(rx => (
                <div key={rx.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100">
                  <Pill className="w-4 h-4 text-purple-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700">{rx.medications.length} medication(s)</p>
                    <p className="text-xs text-slate-500">{rx.doctorName} · {rx.date}</p>
                  </div>
                  <StatusBadge type={getStatusType(rx.status)}>{rx.status}</StatusBadge>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-slate-500 text-center py-4">No prescriptions.</p>}
        </SectionCard>
      </div>

      {/* Follow-ups */}
      <SectionCard title="Follow-ups">
        {followUps.length > 0 ? (
          <div className="space-y-2">
            {followUps.map(f => (
              <div key={f.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100">
                <ClipboardList className="w-4 h-4 text-brand-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700">{f.reason}</p>
                  <p className="text-xs text-slate-500">{f.doctorName} · Requested: {f.requestedDate}
                    {f.suggestedDate && ` · Suggested: ${f.suggestedDate}`}
                  </p>
                </div>
                <StatusBadge type={getStatusType(f.status)} dot>{f.status}</StatusBadge>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-slate-500 text-center py-4">No follow-ups.</p>}
      </SectionCard>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: typeof UserIcon; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-0.5">
        <Icon className="w-3 h-3" /> {label}
      </div>
      <p className="text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}
