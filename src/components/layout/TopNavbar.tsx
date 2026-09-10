import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { roleLabels, roleBadgeColors } from '@/data/mockData';
import { Search, Bell, Menu, ChevronDown, Settings, LogOut, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockNotifications } from '@/data/mockData';

export function TopNavbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!user) return null;

  const unreadCount = mockNotifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/80 backdrop-blur border-b border-slate-200 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3 flex-1">
        <button onClick={onOpenSidebar} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="relative max-w-md flex-1 hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search patients, appointments, documents..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Organization name */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-sm font-medium text-slate-600">{user.organization}</span>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 card shadow-xl overflow-hidden animate-slide-up">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">Notifications</span>
                <span className="text-xs text-brand-600 font-medium">{unreadCount} unread</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {mockNotifications.slice(0, 5).map((n) => (
                  <div key={n.id} className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!n.read ? 'bg-brand-50/30' : ''}`}>
                    <div className="flex items-start gap-2">
                      {!n.read && <span className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700">{n.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{n.timestamp}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => { setNotifOpen(false); navigate('/notifications'); }}
                className="w-full px-4 py-2.5 text-sm text-brand-600 font-medium hover:bg-brand-50 transition-colors"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-teal-500 flex items-center justify-center text-sm font-semibold text-white">
              {user.name.charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-slate-700 leading-tight">{user.name}</p>
              <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium border ${roleBadgeColors[user.role]}`}>
                {roleLabels[user.role]}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 card shadow-xl overflow-hidden animate-slide-up">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-700">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
                <p className="text-xs text-slate-400 mt-1">{user.department}</p>
              </div>
              <button
                onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Settings className="w-4 h-4" /> Settings
              </button>
              <button
                onClick={() => { setProfileOpen(false); navigate('/profile'); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <UserIcon className="w-4 h-4" /> My Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors border-t border-slate-100"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
