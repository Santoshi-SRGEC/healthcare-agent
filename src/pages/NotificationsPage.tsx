import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PageLoading, ErrorState, EmptyState } from '@/components/ui/States';
import {
  Bell, FlaskConical, CalendarClock, ListChecks, Pill, ClipboardList,
  Brain, Activity, CheckCheck, BellOff
} from 'lucide-react';
import type { Notification } from '@/types';

export function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = async () => {
    setLoading(true); setError(null);
    try { setNotifications(await api.getNotifications()); } catch { setError('Failed to load notifications.'); }
    finally { setLoading(false); }
  };

  if (loading) return <PageLoading label="Loading notifications..." />;
  if (error) return <ErrorState message={error} onRetry={loadNotifications} />;

  const filtered = notifications.filter(n => filter === 'all' || (filter === 'unread' && !n.read) || (filter === 'read' && n.read));

  const markAllRead = () => setNotifications(notifications.map(n => ({ ...n, read: true })));
  const toggleRead = (id: string) => setNotifications(notifications.map(n => n.id === id ? { ...n, read: !n.read } : n));

  const icons: Record<string, typeof Bell> = {
    lab_report: FlaskConical,
    appointment: CalendarClock,
    task: ListChecks,
    prescription: Pill,
    followup: ClipboardList,
    ai_alert: Brain,
    system: Activity,
  };

  const iconColors: Record<string, string> = {
    lab_report: 'bg-amber-50 text-amber-600',
    appointment: 'bg-brand-50 text-brand-600',
    task: 'bg-slate-100 text-slate-600',
    prescription: 'bg-purple-50 text-purple-600',
    followup: 'bg-teal-50 text-teal-600',
    ai_alert: 'bg-violet-50 text-violet-600',
    system: 'bg-slate-100 text-slate-500',
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">{notifications.filter(n => !n.read).length} unread of {notifications.length} total</p>
        </div>
        <button onClick={markAllRead} className="btn-secondary flex items-center gap-2">
          <CheckCheck className="w-4 h-4" /> Mark all read
        </button>
      </div>

      <div className="flex gap-2">
        {(['all', 'unread', 'read'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
              filter === f ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={BellOff} title="No notifications" description={filter === 'unread' ? "You're all caught up!" : "No notifications to display."} />
      ) : (
        <div className="card divide-y divide-slate-100">
          {filtered.map(n => {
            const Icon = icons[n.type] || Bell;
            return (
              <div key={n.id} onClick={() => toggleRead(n.id)}
                className={`flex items-start gap-3 p-4 cursor-pointer transition-colors hover:bg-slate-50 ${!n.read ? 'bg-brand-50/30' : ''}`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconColors[n.type] || 'bg-slate-100 text-slate-500'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900">{n.title}</p>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{n.timestamp}</p>
                </div>
                {n.patientName && <span className="text-xs text-slate-400 hidden sm:block mt-1">{n.patientName}</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
