// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, Role } from '@/types';
import { api } from '@/services/api';
import { rolePermissions } from '@/data/mockData';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string, role: Role) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'careflow_auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Restore session on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = localStorage.getItem(TOKEN_KEY);
        if (!raw) {
          setLoading(false);
          return;
        }
        const parsed = JSON.parse(raw);
        if (parsed?.user) setUser(parsed.user);

        // Optionally verify with backend
        const fresh = await api.me();
        if (fresh) setUser(fresh);
        else if (!parsed?.user) {
          localStorage.removeItem(TOKEN_KEY);
          setUser(null);
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string, role: Role) => {
    setLoading(true);
    setError(null);
    try {
      const { user: u, token } = await api.login(email, password, role);
      setUser(u);
      localStorage.setItem(TOKEN_KEY, JSON.stringify({ user: u, token }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return rolePermissions[user.role]?.includes(permission) ?? false;
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}