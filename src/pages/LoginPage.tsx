import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Activity, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, Shield } from 'lucide-react';
import type { Role } from '@/types';
import { roleLabels } from '@/data/mockData';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>('receptionist');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email.trim()) {
      setFormError('Email is required');
      return;
    }
    if (!password.trim()) {
      setFormError('Password is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError('Please enter a valid email address');
      return;
    }

    try {
      await login(email, password, role);
      navigate('/dashboard');
    } catch {
      // error handled by context
    }
  };

  const fillDemo = (demoEmail: string, demoRole: Role) => {
    setEmail(demoEmail);
    setPassword('demo123');
    setRole(demoRole);
    setFormError(null);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-700 via-brand-800 to-teal-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-teal-300 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold">CareFlow AI</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold leading-tight mb-4">
              Healthcare Workflow &<br />Care Coordination
            </h1>
            <p className="text-lg text-brand-100 leading-relaxed max-w-md">
              Connecting receptionists, doctors, laboratory staff, and pharmacy through one intelligent workflow platform.
            </p>
            <div className="mt-8 space-y-3">
              {[
                'AI-assisted workflow coordination',
                'Role-based access control',
                'End-to-end care pathway visibility',
                'Human-in-the-loop clinical decisions',
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3 text-brand-100">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-brand-200">© 2025 CareFlow AI. Clinical decisions remain with authorized professionals.</p>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">CareFlow AI</span>
          </div>

          <div className="card p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h2>
            <p className="text-sm text-slate-500 mb-6">Sign in to your CareFlow AI account</p>

            {(error || formError) && (
              <div className="flex items-start gap-2 p-3 mb-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm animate-fade-in">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{formError || error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@hospital.com"
                    className="input-field pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="input-field pl-10 pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="input-field"
                  disabled={loading}
                >
                  {(Object.keys(roleLabels) as Role[]).map((r) => (
                    <option key={r} value={r}>
                      {roleLabels[r]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                  Remember me
                </label>
                <button type="button" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
                  Forgot password?
                </button>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-500 mb-3 text-center">Quick demo login — click to fill:</p>
              <div className="grid grid-cols-2 gap-2">
                {([
                  ['reception@careflow.ai', 'receptionist'],
                  ['doctor@careflow.ai', 'doctor'],
                  ['lab@careflow.ai', 'lab'],
                  ['pharmacy@careflow.ai', 'pharmacy'],
                ] as [string, Role][]).map(([em, r]) => (
                  <button
                    key={em}
                    onClick={() => fillDemo(em, r)}
                    className="text-xs px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition-all"
                  >
                    {roleLabels[r]}
                  </button>
                ))}
              </div>
              <button
                onClick={() => fillDemo('admin@careflow.ai', 'admin')}
                className="mt-2 w-full text-xs px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition-all flex items-center justify-center gap-1.5"
              >
                <Shield className="w-3 h-3" /> Admin
              </button>
              <p className="text-xs text-slate-400 mt-3 text-center">Password for all demo accounts: demo123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
