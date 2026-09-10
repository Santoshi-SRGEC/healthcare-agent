import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { StatusBadge, getStatusType } from '@/components/ui/StatusBadge';
import { PageLoading, ErrorState, EmptyState } from '@/components/ui/States';
import { UserCog, Search, Shield, Activity } from 'lucide-react';
import { roleLabels, roleBadgeColors, rolePermissions } from '@/data/mockData';
import type { User } from '@/types';

export function AdminUsersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true); setError(null);
    try { setUsers(await api.getUsers()); } catch { setError('Failed to load users.'); }
    finally { setLoading(false); }
  };

  if (loading) return <PageLoading label="Loading users..." />;
  if (error) return <ErrorState message={error} onRetry={loadUsers} />;

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <p className="text-sm text-slate-500 mt-1">{users.length} users across all roles</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Search users by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={UserCog} title="No users found" />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="table-header">Name</th>
                  <th className="table-header">Email</th>
                  <th className="table-header">Role</th>
                  <th className="table-header hidden md:table-cell">Department</th>
                  <th className="table-header hidden lg:table-cell">Organization</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(u => (
                  <tr key={u.id} className="table-row-hover">
                    <td className="table-cell">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">{u.name.charAt(0)}</div>
                        <span className="font-medium text-slate-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="table-cell text-slate-500">{u.email}</td>
                    <td className="table-cell">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${roleBadgeColors[u.role]}`}>{roleLabels[u.role]}</span>
                    </td>
                    <td className="table-cell hidden md:table-cell text-slate-500">{u.department}</td>
                    <td className="table-cell hidden lg:table-cell text-slate-500">{u.organization}</td>
                    <td className="table-cell"><StatusBadge type="success" dot>Active</StatusBadge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminRolesPage() {
  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Roles & Permissions</h1>
        <p className="text-sm text-slate-500 mt-1">Role-based access control configuration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(Object.keys(roleLabels) as (keyof typeof roleLabels)[]).map(role => (
          <div key={role} className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                <Shield className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${roleBadgeColors[role]}`}>{roleLabels[role]}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              {rolePermissions[role].map(perm => (
                <div key={perm} className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <code className="font-mono">{perm}</code>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="card p-4 bg-amber-50/50 border-amber-100">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">Security Note</p>
            <p className="text-xs text-slate-600 mt-0.5">Frontend navigation is hidden based on role, but the backend independently enforces all permissions. Never rely on frontend hiding alone for security.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminAuditLogsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => { loadLogs(); }, []);

  const loadLogs = async () => {
    setLoading(true); setError(null);
    try { setLogs(await api.getAuditLogs()); } catch { setError('Failed to load audit logs.'); }
    finally { setLoading(false); }
  };

  if (loading) return <PageLoading label="Loading audit logs..." />;
  if (error) return <ErrorState message={error} onRetry={loadLogs} />;

  const filtered = logs.filter(l => l.user.toLowerCase().includes(search.toLowerCase()) || l.action.toLowerCase().includes(search.toLowerCase()) || l.resource.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
        <p className="text-sm text-slate-500 mt-1">{logs.length} audit entries</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Search by user, action, or resource..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Activity} title="No audit logs found" />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="table-header">Timestamp</th>
                  <th className="table-header">User</th>
                  <th className="table-header">Action</th>
                  <th className="table-header hidden md:table-cell">Resource</th>
                  <th className="table-header hidden lg:table-cell">Details</th>
                  <th className="table-header">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(log => (
                  <tr key={log.id} className="table-row-hover">
                    <td className="table-cell font-mono text-xs text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5">
                        {log.userId === 'ai' ? <span className="w-5 h-5 rounded bg-violet-100 flex items-center justify-center text-[10px]">AI</span> : <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-semibold text-slate-600">{log.user.charAt(0)}</div>}
                        <span className="text-xs font-medium text-slate-700">{log.user}</span>
                      </div>
                    </td>
                    <td className="table-cell"><code className="text-xs text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded">{log.action}</code></td>
                    <td className="table-cell hidden md:table-cell text-xs text-slate-500">{log.resource}{log.resourceId && <span className="text-slate-400"> ({log.resourceId})</span>}</td>
                    <td className="table-cell hidden lg:table-cell text-xs text-slate-500 max-w-xs truncate">{log.details}</td>
                    <td className="table-cell"><StatusBadge type={getStatusType(log.result)}>{log.result}</StatusBadge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Need to import AuditLog type
import type { AuditLog } from '@/types';

export function AdminOrganizationsPage() {
  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Organizations</h1>
        <p className="text-sm text-slate-500 mt-1">Manage healthcare organization configurations</p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-teal-500 flex items-center justify-center">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">City General Hospital</h2>
            <p className="text-sm text-slate-500">Active · 6 users · 8 patients</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="p-3 rounded-lg bg-slate-50"><p className="text-xs text-slate-400">Departments</p><p className="text-lg font-bold text-slate-900">5</p></div>
          <div className="p-3 rounded-lg bg-slate-50"><p className="text-xs text-slate-400">Total Users</p><p className="text-lg font-bold text-slate-900">6</p></div>
          <div className="p-3 rounded-lg bg-slate-50"><p className="text-xs text-slate-400">Active Patients</p><p className="text-lg font-bold text-slate-900">8</p></div>
          <div className="p-3 rounded-lg bg-slate-50"><p className="text-xs text-slate-400">Plan</p><p className="text-lg font-bold text-slate-900">Enterprise</p></div>
        </div>
      </div>
    </div>
  );
}

export function AdminSystemActivityPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAuditLogs().then(data => { setLogs(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <PageLoading label="Loading system activity..." />;

  const aiActions = logs.filter(l => l.userId === 'ai');
  const humanActions = logs.filter(l => l.userId !== 'ai');

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Activity</h1>
        <p className="text-sm text-slate-500 mt-1">Real-time system and agent activity overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-2"><Activity className="w-4 h-4 text-brand-500" /><p className="text-xs text-slate-500">Total Events</p></div>
          <p className="text-2xl font-bold text-slate-900">{logs.length}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-2"><Shield className="w-4 h-4 text-violet-500" /><p className="text-xs text-slate-500">AI Agent Actions</p></div>
          <p className="text-2xl font-bold text-slate-900">{aiActions.length}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-2"><UserCog className="w-4 h-4 text-emerald-500" /><p className="text-xs text-slate-500">Human Actions</p></div>
          <p className="text-2xl font-bold text-slate-900">{humanActions.length}</p>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Recent System Events</h3>
        <div className="space-y-2">
          {logs.slice(0, 8).map(log => (
            <div key={log.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${log.userId === 'ai' ? 'bg-violet-50 text-violet-600' : 'bg-slate-100 text-slate-500'}`}>
                {log.userId === 'ai' ? <Activity className="w-4 h-4" /> : <UserCog className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700">{log.details || log.action}</p>
                <p className="text-xs text-slate-500">{log.user} · {log.timestamp}</p>
              </div>
              <StatusBadge type={getStatusType(log.result)}>{log.result}</StatusBadge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminSecurityPage() {
  const securityFeatures = [
    { title: 'Role-Based Access Control', status: 'Active', desc: 'Backend enforces permissions independently of frontend navigation hiding.' },
    { title: 'Audit Logging', status: 'Active', desc: 'All user and AI agent actions are logged with timestamp, user, action, and resource.' },
    { title: 'Input Validation', status: 'Active', desc: 'Pydantic models validate all API inputs on the backend.' },
    { title: 'CORS Configuration', status: 'Configured', desc: 'Cross-origin requests restricted to authorized origins.' },
    { title: 'API Rate Limiting', status: 'Placeholder', desc: 'Rate limiting middleware ready for activation in production.' },
    { title: 'Document Validation', status: 'Placeholder', desc: 'File type and size validation framework ready for production.' },
    { title: 'AI Tool Permission Checks', status: 'Active', desc: 'AI agent tools are validated against role permissions before execution.' },
    { title: 'Prompt Injection Protection', status: 'Planned', desc: 'Input sanitization middleware for AI prompts can be added as a layer.' },
    { title: 'Malicious Document Protection', status: 'Planned', desc: 'Document scanning and validation pipeline can be integrated.' },
    { title: 'Secrets Management', status: 'Active', desc: 'API keys and secrets stored in environment variables, never in frontend code.' },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Security</h1>
        <p className="text-sm text-slate-500 mt-1">Security posture and production-readiness checklist</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {securityFeatures.map(f => {
          const type = f.status === 'Active' ? 'success' : f.status === 'Configured' ? 'info' : 'warning';
          return (
            <div key={f.title} className="card p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-700">{f.title}</h3>
                </div>
                <StatusBadge type={type} dot>{f.status}</StatusBadge>
              </div>
              <p className="text-xs text-slate-500">{f.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
