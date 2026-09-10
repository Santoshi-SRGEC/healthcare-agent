import type { ReactNode } from 'react';

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'ai';

const styles: Record<StatusType, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  error: 'bg-rose-50 text-rose-700 border-rose-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  neutral: 'bg-slate-100 text-slate-600 border-slate-200',
  ai: 'bg-violet-50 text-violet-700 border-violet-200',
};

export function StatusBadge({
  status,
  children,
  type = 'neutral',
  dot = false,
}: {
  status?: string;
  children: ReactNode;
  type?: StatusType;
  dot?: boolean;
}) {
  const dotColors: Record<StatusType, string> = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-rose-500',
    info: 'bg-blue-500',
    neutral: 'bg-slate-400',
    ai: 'bg-violet-500',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[type]}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[type]}`} />}
      {children}
    </span>
  );
}

export function getStatusType(status: string): StatusType {
  const map: Record<string, StatusType> = {
    'Confirmed': 'success',
    'Completed': 'success',
    'Approved': 'success',
    'Sent': 'info',
    'Active': 'success',
    'Pending': 'warning',
    'In Progress': 'info',
    'Processing': 'info',
    'Needs Review': 'warning',
    'Needs Approval': 'warning',
    'Awaiting Approval': 'warning',
    'Requested': 'warning',
    'AI Suggested': 'ai',
    'AI Summary Available': 'ai',
    'Uploaded': 'neutral',
    'Reviewed': 'success',
    'Cancelled': 'error',
    'Rejected': 'error',
    'Failed': 'error',
    'Urgent': 'error',
    'High': 'warning',
    'Medium': 'info',
    'Low': 'neutral',
  };
  return map[status] || 'neutral';
}
