'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Lock, Mail, Zap } from 'lucide-react';
import { useAuth, UserRole } from '../../components/auth/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const roles: UserRole[] = ['Admin', 'Event Organizer', 'Peserta'];

export default function LoginRoute() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [role, setRole] = useState<UserRole>('Admin');
  const defaultEmail = useMemo(() => {
    if (role === 'Admin') return 'admin@universitas.ac.id';
    if (role === 'Event Organizer') return 'eo@universitas.ac.id';
    return 'peserta@universitas.ac.id';
  }, [role]);
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setEmail(defaultEmail);
  }, [defaultEmail]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const success = await login(role, email, password);
    if (!success) {
      setError('Email atau password tidak valid atau role tidak sesuai.');
      return;
    }
    router.push('/dashboard');
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

          <form className="space-y-6 rounded-[32px] bg-[#1D1640] p-8 shadow-card" onSubmit={handleSubmit}>
            <div className="flex flex-wrap gap-3">
              {roles.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRole(option)}
                  className={`rounded-3xl border px-5 py-3 text-sm font-semibold transition ${
                    role === option
                      ? 'border-[#7C53F2] bg-[#635BFA]/10 text-white'
                      : 'border-slate-700 text-slate-300 hover:border-[#7C53F2] hover:text-white'
                  }`}>
                  {option}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-300">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@domain.com" className="pl-11" />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-300">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan password" className="pl-11" />
              </div>
            </div>

            {error ? <p className="text-sm text-rose-400">{error}</p> : null}

            <Button type="submit" className="w-full bg-[#5C4BD5] text-white hover:bg-[#7C53F2]">Masuk ke Dashboard</Button>
          </form>
        </div>

        <div className="hidden flex-col justify-between rounded-[32px] bg-gradient-to-br from-[#3B3086] via-[#605DDD] to-[#1D1640] p-10 text-white shadow-card md:flex">
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
