// src/pages/DashboardPage.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { KPICard, SectionCard, AIBadge } from '@/components/ui/KPICard';
import { StatusBadge, getStatusType } from '@/components/ui/StatusBadge';
import { PageLoading, ErrorState } from '@/components/ui/States';
import {
  Users, CalendarClock, ListChecks, FlaskConical,
  Activity, Pill, ClipboardList, Brain, ArrowRight, Clock
} from 'lucide-react';
import type { Patient, Appointment, Task, Notification, AIWorkflow } from '@/types';
import { useNavigate } from 'react-router-dom';
import { roleLabels } from '@/data/mockData';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [workflows, setWorkflows] = useState<AIWorkflow[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Promise.allSettled → one failing call doesn't break the whole dashboard
      const results = await Promise.allSettled([
        api.getPatients(),
        api.getAppointments(),
        api.getTasks(),
        api.getNotifications(),
        api.getAIWorkflows(),
      ]);

      const [p, a, t, n, w] = results;
      setPatients(p.status === 'fulfilled' ? p.value : []);
      setAppointments(a.status === 'fulfilled' ? a.value : []);
      setTasks(t.status === 'fulfilled' ? t.value : []);
      setNotifications(n.status === 'fulfilled' ? n.value : []);
      setWorkflows(w.status === 'fulfilled' ? w.value : []);
    } catch {
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoading label="Loading dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;
  if (!user) return null;

  const today = new Date().toISOString().split('T')[0];
  const todaysAppointments = appointments.filter((a) => a.date === today);
  const pendingTasks = tasks.filter(
    (t) =>
      t.status === 'Pending' ||
      t.status === 'Needs Review' ||
      t.status === 'Needs Approval'
  );
  const reportsAwaiting = tasks.filter((t) => t.status === 'Needs Review');
  const pendingApprovals = workflows.filter(
    (w) => w.approvalStatus === 'pending'
  );
  const recentActivity = notifications.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user.name.split(' ')[0]}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {roleLabels[user.role]} Dashboard · {user.organization}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Patients"
          value={patients.length}
          icon={Users}
          trend="+12%"
          trendUp
          color="brand"
        />
        <KPICard
          label="Today's Appointments"
          value={todaysAppointments.length}
          icon={CalendarClock}
          trend="+3"
          trendUp
          color="teal"
        />
        <KPICard
          label="Pending Tasks"
          value={pendingTasks.length}
          icon={ListChecks}
          trend="-2"
          trendUp={false}
          color="amber"
        />
        <KPICard
          label="Reports Awaiting Review"
          value={reportsAwaiting.length}
          icon={FlaskConical}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <div className="lg:col-span-2">
          <SectionCard
            title="Today's Appointments"
            action={
              <button
                onClick={() => navigate('/appointments')}
                className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <div className="space-y-3">
              {todaysAppointments.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">
                  No appointments scheduled for today.
                </p>
              ) : (
                todaysAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center gap-4 p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all"
                  >
                    <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-brand-50 text-brand-700">
                      <Clock className="w-4 h-4 mb-0.5" />
                      <span className="text-[10px] font-medium">{apt.time}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {apt.patientName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {apt.department} · {apt.doctorName}
                      </p>
                    </div>
                    <StatusBadge type={getStatusType(apt.status)} dot>
                      {apt.status}
                    </StatusBadge>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>

        {/* AI Workflow Alert */}
        <div>
          <div className="card p-5 bg-gradient-to-br from-violet-50 to-white border-violet-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                <Brain className="w-4 h-4 text-violet-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700">
                AI Workflow Alert
              </h3>
            </div>
            <AIBadge />
            <p className="text-sm text-slate-600 mt-3 mb-4">
              <span className="font-semibold text-violet-700">
                {pendingApprovals.length +
                  pendingTasks.filter((t) => t.aiGenerated).length}{' '}
                workflow actions
              </span>{' '}
              require attention
            </p>
            <div className="space-y-2">
              {pendingApprovals.slice(0, 3).map((w) => (
                <div
                  key={w.id}
                  className="p-2.5 rounded-lg bg-white border border-violet-100"
                >
                  <p className="text-xs font-medium text-slate-700">
                    {w.trigger}
                  </p>
                  <p className="text-xs text-violet-600 mt-0.5">{w.status}</p>
                </div>
              ))}
              {pendingTasks
                .filter((t) => t.aiGenerated)
                .slice(0, 2)
                .map((t) => (
                  <div
                    key={t.id}
                    className="p-2.5 rounded-lg bg-white border border-violet-100"
                  >
                    <p className="text-xs font-medium text-slate-700">
                      {t.title}
                    </p>
                    <p className="text-xs text-amber-600 mt-0.5">{t.status}</p>
                  </div>
                ))}
              {pendingApprovals.length === 0 &&
                pendingTasks.filter((t) => t.aiGenerated).length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-3">
                    No pending AI actions right now.
                  </p>
                )}
            </div>
            <button
              onClick={() => navigate('/ai-workflow')}
              className="w-full mt-4 text-sm text-violet-700 font-medium hover:text-violet-800 flex items-center justify-center gap-1"
            >
              Review AI workflows <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Pending Workflow + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Pending Workflow">
          <div className="space-y-3">
            {pendingTasks.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">
                No pending tasks. You're all caught up!
              </p>
            ) : (
              pendingTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-all"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      task.priority === 'Urgent'
                        ? 'bg-rose-50 text-rose-600'
                        : task.priority === 'High'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-slate-50 text-slate-500'
                    }`}
                  >
                    {task.aiGenerated ? (
                      <Brain className="w-4 h-4" />
                    ) : (
                      <ClipboardList className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700">
                      {task.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {task.assignedTo} · {task.department}
                      {task.aiGenerated && (
                        <span className="text-violet-600 ml-1">
                          · AI Generated
                        </span>
                      )}
                    </p>
                  </div>
                  <StatusBadge type={getStatusType(task.status)}>
                    {task.status}
                  </StatusBadge>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard title="Recent Activity">
          <div className="space-y-2">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">
                No recent activity.
              </p>
            ) : (
              recentActivity.map((n) => {
                const icons: Record<string, typeof Activity> = {
                  lab_report: FlaskConical,
                  appointment: CalendarClock,
                  task: ListChecks,
                  prescription: Pill,
                  followup: ClipboardList,
                  ai_alert: Brain,
                  system: Activity,
                };
                const Icon = icons[n.type] || Activity;
                return (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700">
                        {n.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {n.timestamp}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}