import { useAuth } from '@/context/AuthContext';
import { roleLabels, roleBadgeColors } from '@/data/mockData';
import { Settings, User as UserIcon, Bell, Shield, Globe } from 'lucide-react';

export function SettingsPage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="space-y-5 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Settings */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <UserIcon className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-700">Profile</h3>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-teal-500 flex items-center justify-center text-2xl font-bold text-white">
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">{user.name}</p>
            <p className="text-sm text-slate-500">{user.email}</p>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium border ${roleBadgeColors[user.role]}`}>
              {roleLabels[user.role]}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
            <input className="input-field" defaultValue={user.name} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <input className="input-field" defaultValue={user.email} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Department</label>
            <input className="input-field" defaultValue={user.department || ''} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Organization</label>
            <input className="input-field" defaultValue={user.organization} disabled />
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-700">Notification Preferences</h3>
        </div>
        <div className="space-y-3">
          {['Email notifications for new tasks', 'Alerts for urgent lab reports', 'AI workflow approval requests', 'Daily summary digest'].map((pref, i) => (
            <label key={pref} className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-slate-600">{pref}</span>
              <input type="checkbox" defaultChecked={i < 3} className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
            </label>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-700">Security</h3>
        </div>
        <div className="space-y-3">
          <button className="btn-secondary w-full text-left flex items-center justify-between">
            <span>Change Password</span>
            <Settings className="w-4 h-4 text-slate-400" />
          </button>
          <button className="btn-secondary w-full text-left flex items-center justify-between">
            <span>Two-Factor Authentication</span>
            <span className="text-xs text-amber-600">Not configured</span>
          </button>
          <button className="btn-secondary w-full text-left flex items-center justify-between">
            <span>Active Sessions</span>
            <span className="text-xs text-slate-400">1 active</span>
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button className="btn-secondary">Cancel</button>
        <button className="btn-primary">Save Changes</button>
      </div>
    </div>
  );
}
