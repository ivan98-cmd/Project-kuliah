'use client';

import { Award, BarChart3, CalendarDays, ListChecks, LogOut, Settings, Sparkles, Users, Wallet } from 'lucide-react';
import { Badge } from '../ui';
import { useAuth } from '../auth/AuthContext';

interface SidebarProps {
  selectedTab: string;
  onSelect: (tab: string) => void;
}

export function Sidebar({ selectedTab, onSelect }: SidebarProps) {
  const { logout, user } = useAuth();
  const role = user?.role ?? 'Admin';

  const navItems = role === 'Peserta'
    ? [
        { label: 'Beranda', icon: BarChart3 },
        { label: 'Daftar Event', icon: CalendarDays },
        { label: 'Event Saya', icon: ListChecks },
        { label: 'E-Tiket', icon: Users },
        { label: 'Profil', icon: Settings },
      ]
    : role === 'Event Organizer'
    ? [
        { label: 'Dashboard', icon: BarChart3 },
        { label: 'Kelola Event', icon: CalendarDays },
        { label: 'Peserta', icon: Users },
        { label: 'Rundown Acara', icon: ListChecks },
        { label: 'AI Event Assistant', icon: Sparkles, badge: 'AI' },
        { label: 'Laporan', icon: Award },
        { label: 'Pengaturan', icon: Settings },
      ]
    : [
        { label: 'Dashboard', icon: BarChart3 },
        { label: 'Kelola Event', icon: CalendarDays },
        { label: 'Peserta', icon: Users },
        { label: 'Laporan', icon: Award },
        { label: 'Pengaturan', icon: Settings },
      ];

  return (
    <aside className="hidden xl:flex xl:w-80 flex-col gap-8 rounded-[32px] bg-[#1D1640]/80 p-8 text-slate-100 shadow-card backdrop-blur-xl">
      <div className="space-y-4">
        <div>
          <p className="text-2xl font-semibold text-white">SyncEvent</p>
          <p className="text-sm text-slate-400">Platform Berbasis Web</p>
        </div>
        <AuthProfile />
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = selectedTab === item.label;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onSelect(item.label)}
              className={`flex w-full items-center justify-between rounded-3xl px-4 py-3 text-left transition ${
                isActive
                  ? 'bg-slate-900 text-white shadow-lg shadow-indigo-500/10'
                  : 'text-slate-300 hover:bg-slate-900/70 hover:text-white'
              }`}>
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </div>
              {item.badge ? <Badge>{item.badge}</Badge> : null}
            </button>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={logout}
        className="mt-auto flex items-center gap-3 rounded-3xl bg-slate-900/70 px-4 py-3 text-slate-200 transition hover:bg-slate-800">
        <LogOut className="h-5 w-5" />
        <span>Keluar</span>
      </button>
    </aside>
  );
}

function AuthProfile() {
  const { user } = useAuth();
  const initials = user?.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="rounded-3xl bg-[#241B4D] p-4">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-200">{initials}</div>
        <div>
          <p className="font-semibold">{user?.name ?? 'Pengguna'}</p>
          <p className="text-sm text-slate-400">{user?.email ?? 'guest@domain.com'}</p>
        </div>
      </div>
    </div>
  );
}
