'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Lock, Mail, Zap } from 'lucide-react';
import { useAuth } from '../../components/auth/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const roleOptions = [
  { value: 'Admin', label: 'Admin' },
  { value: 'Event Organizer', label: 'Event Organizer' },
  { value: 'Peserta', label: 'Peserta' },
];

export default function LoginRoute() {
  const router = useRouter();
  const { login, isAuthenticated, user } = useAuth();
  const [role, setRole] = useState('Admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath =
        user.role === 'Admin'
          ? '/admin/dashboard'
          : user.role === 'Event Organizer'
          ? '/eo/dashboard'
          : '/peserta/dashboard';
      router.replace(redirectPath);
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const success = await login(email, password, role);
    if (!success) {
      setError('Email, password, atau role tidak valid. Silakan coba kembali.');
      return;
    }

    const redirectPath =
      role === 'Admin'
        ? '/admin/dashboard'
        : role === 'Event Organizer'
        ? '/eo/dashboard'
        : '/peserta/dashboard';
    router.push(redirectPath);
  };

  return (
    <main className="min-h-screen bg-[#0d0821] px-6 py-10 text-slate-100 md:px-12 lg:px-16">
      <div className="mx-auto grid max-w-6xl gap-10 rounded-[40px] border border-white/10 bg-white/5 p-6 shadow-card backdrop-blur-2xl md:grid-cols-[1.1fr_0.9fr] md:p-10">
        <div className="space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#3B3086]/20 px-4 py-2 text-sm text-slate-200">
              <Zap className="h-4 w-4 text-[#A78BFA]" />
              SyncEvent • Masuk ke dashboard
            </div>
            <div>
              <h1 className="text-4xl font-semibold text-white">Masuk ke SyncEvent</h1>
              <p className="max-w-xl text-slate-400">Gunakan akun Admin, Event Organizer, atau Peserta untuk mengakses fitur sesuai peran.</p>
            </div>
          </div>

          <form className="space-y-6 rounded-[32px] bg-[#14316B] p-8 shadow-card" onSubmit={handleSubmit}>
            <div className="flex flex-wrap gap-3">
              {roleOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRole(option.value)}
                  className={`rounded-3xl border px-5 py-3 text-sm font-semibold transition ${
                    role === option.value
                      ? 'border-[#60A5FA] bg-[#2563EB]/15 text-white'
                      : 'border-slate-700 text-slate-300 hover:border-[#60A5FA] hover:text-white'
                  }`}>
                  {option.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-300">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@domain.com" className="pl-11" />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-300">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan password" className="pl-11" />
              </div>
            </div>

            {error ? <p className="text-sm text-rose-400">{error}</p> : null}

            <Button type="submit" className="w-full bg-[#2563EB] text-white hover:bg-[#60A5FA]">Login</Button>
          </form>

          <p className="text-center text-sm text-slate-400">
            Belum punya akun?{' '}
            <Link href="/register" className="font-semibold text-white underline decoration-[#60A5FA]/30">
              Daftar akun baru
            </Link>
          </p>
        </div>

        <div className="hidden flex-col justify-between rounded-[32px] bg-gradient-to-br from-[#1D4ED8] via-[#2563EB] to-[#0F172A] p-10 text-white shadow-card md:flex">
          <div>
            <div className="flex items-center justify-between rounded-3xl bg-white/10 p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-200">SyncEvent</p>
                <p className="mt-2 text-lg font-semibold">Manajemen Event Modern</p>
              </div>
              <span className="rounded-3xl bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-200">2026</span>
            </div>

            <div className="mt-10 space-y-6">
              <div className="rounded-[28px] bg-white/10 p-6">
                <p className="text-sm text-slate-300">Masuk menggunakan kredensial aman</p>
                <p className="mt-3 text-3xl font-semibold">Kontrol event, peserta, dan laporan secara realtime.</p>
              </div>
              <div className="grid gap-4">
                <div className="space-y-2 rounded-[28px] bg-white/10 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Event</p>
                  <p className="text-2xl font-semibold">5 Aktif</p>
                </div>
                <div className="space-y-2 rounded-[28px] bg-white/10 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Pendapatan</p>
                  <p className="text-2xl font-semibold">Rp 43.650.000</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto flex items-center gap-3 rounded-3xl bg-white/10 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">SE</div>
            <div>
              <p className="font-semibold">Sinkronisasi Event</p>
              <p className="text-sm text-slate-300">Masuk dan mulai kelola acara Anda.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
