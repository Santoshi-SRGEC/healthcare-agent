import type { Role } from '@/types';
import {
  LayoutDashboard, Users, CalendarDays, FileText, ListChecks,
  Bell, FlaskConical, Pill, ClipboardList, Activity, Brain,
  UserCog, Building2, ShieldCheck, ScrollText, Settings, LogOut,
  Package
} from 'lucide-react';

export interface NavItem {
  label: string;
  icon: typeof LayoutDashboard;
  path: string;
  permission?: string;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const navConfig: Record<Role, NavSection[]> = {
  receptionist: [
    {
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Patients', icon: Users, path: '/patients' },
        { label: 'Appointments', icon: CalendarDays, path: '/appointments' },
        { label: 'Tasks', icon: ListChecks, path: '/tasks' },
        { label: 'Notifications', icon: Bell, path: '/notifications' },
      ],
    },
  ],
  doctor: [
    {
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Patients', icon: Users, path: '/patients' },
        { label: 'Lab Reports', icon: FlaskConical, path: '/lab-reports' },
        { label: 'Documents', icon: FileText, path: '/documents' },
        { label: 'Tasks', icon: ListChecks, path: '/tasks' },
        { label: 'Prescriptions', icon: Pill, path: '/prescriptions' },
        { label: 'Follow-ups', icon: ClipboardList, path: '/followups' },
        { label: 'AI Workflow', icon: Brain, path: '/ai-workflow' },
      ],
    },
  ],
  lab: [
    {
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Lab Requests', icon: FlaskConical, path: '/lab-reports' },
        { label: 'Upload Reports', icon: FileText, path: '/documents' },
        { label: 'Completed Tests', icon: ClipboardList, path: '/tasks' },
        { label: 'Notifications', icon: Bell, path: '/notifications' },
      ],
    },
  ],
  pharmacy: [
    {
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Prescriptions', icon: Pill, path: '/prescriptions' },
        { label: 'Notifications', icon: Bell, path: '/notifications' },
      ],
    },
  ],
  admin: [
    {
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Users', icon: UserCog, path: '/admin/users' },
        { label: 'Organizations', icon: Building2, path: '/admin/organizations' },
        { label: 'Roles & Permissions', icon: ShieldCheck, path: '/admin/roles' },
        { label: 'Audit Logs', icon: ScrollText, path: '/admin/audit-logs' },
        { label: 'System Activity', icon: Activity, path: '/admin/system-activity' },
        { label: 'Security', icon: ShieldCheck, path: '/admin/security' },
      ],
    },
  ],
};

export const bottomNav: NavItem[] = [
  { label: 'Settings', icon: Settings, path: '/settings' },
];
