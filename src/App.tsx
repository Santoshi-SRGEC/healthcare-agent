import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { PatientsPage } from '@/pages/PatientsPage';
import { PatientDetailPage } from '@/pages/PatientDetailPage';
import { AppointmentsPage } from '@/pages/AppointmentsPage';
import { DocumentsPage } from '@/pages/DocumentsPage';
import { LabReportsPage } from '@/pages/LabReportsPage';
import { TasksPage } from '@/pages/TasksPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { PrescriptionsPage } from '@/pages/PrescriptionsPage';
import { FollowUpsPage } from '@/pages/FollowUpsPage';
import { AIWorkflowPage } from '@/pages/AIWorkflowPage';
import { SettingsPage } from '@/pages/SettingsPage';
import {
  AdminUsersPage, AdminRolesPage, AdminAuditLogsPage,
  AdminOrganizationsPage, AdminSystemActivityPage, AdminSecurityPage
} from '@/pages/AdminPages';
import type { ReactNode } from 'react';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/patients/:id" element={<PatientDetailPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/lab-reports" element={<LabReportsPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/prescriptions" element={<PrescriptionsPage />} />
        <Route path="/followups" element={<FollowUpsPage />} />
        <Route path="/ai-workflow" element={<AIWorkflowPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<SettingsPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/roles" element={<AdminRolesPage />} />
        <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
        <Route path="/admin/organizations" element={<AdminOrganizationsPage />} />
        <Route path="/admin/system-activity" element={<AdminSystemActivityPage />} />
        <Route path="/admin/security" element={<AdminSecurityPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
