'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Lock, Mail, User, Zap } from 'lucide-react';
import { useAuth } from '../../components/auth/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function RegisterPage() {
  const router = useRouter();
  const { register, login, isAuthenticated, user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Peserta');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
    setError('');
    setSuccessMessage('');

    if (!name.trim() || !email.includes('@') || password.length < 4) {
      setError('Masukkan nama, email valid, dan password minimal 4 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.');
      return;
    }

    const success = await register(name.trim(), email.trim(), password, role);
    if (!success) {
      setError('Gagal membuat akun. Email mungkin sudah digunakan.');
      return;
    }

    setSuccessMessage('Akun berhasil dibuat. Silakan masuk menggunakan akun baru Anda.');
    setTimeout(() => router.push('/login'), 1200);
  };

  return (
    <main className="min-h-screen bg-[#0f1f3e] px-6 py-10 text-slate-100 md:px-12 lg:px-16">
      <div className="mx-auto grid max-w-6xl gap-10 rounded-[40px] border border-white/10 bg-white/5 p-6 shadow-card backdrop-blur-2xl md:grid-cols-[1.1fr_0.9fr] md:p-10">
        <div className="space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#2563EB]/15 px-4 py-2 text-sm text-slate-200">
              <Zap className="h-4 w-4 text-[#60A5FA]" />
              SyncEvent • Daftar akun baru
            </div>
            <div>
              <h1 className="text-4xl font-semibold text-white">Buat akun SyncEvent</h1>
              <p className="max-w-xl text-slate-400">Pilih role yang sesuai untuk mengakses fitur Admin, Event Organizer, atau Peserta.</p>
            </div>
          </div>

          <form className="space-y-6 rounded-[32px] bg-[#14316B] p-8 shadow-card" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-300">Nama Lengkap</label>
              <div className="relative">
                <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap" className="pl-11" />
              </div>
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
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 4 karakter" className="pl-11" />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-300">Konfirmasi Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ulangi password" className="pl-11" />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-300">Role</label>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { value: 'Admin', label: 'Admin' },
                  { value: 'Event Organizer', label: 'Event Organizer' },
                  { value: 'Peserta', label: 'Peserta' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRole(option.value)}
                    className={`rounded-3xl border px-4 py-3 text-sm font-semibold transition ${
                      role === option.value
                        ? 'border-[#60A5FA] bg-[#2563EB]/15 text-white'
                        : 'border-slate-700 text-slate-300 hover:border-[#60A5FA] hover:text-white'
                    }`}>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {error ? <p className="text-sm text-rose-400">{error}</p> : null}
            {successMessage ? <p className="text-sm text-emerald-300">{successMessage}</p> : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center justify-center rounded-3xl border border-slate-600 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-[#60A5FA] hover:text-white">
                Kembali
              </button>
              <Button type="submit" className="w-full bg-[#2563EB] text-white hover:bg-[#60A5FA] sm:w-auto">
                Buat Akun
              </Button>
            </div>
          </form>
        </div>

        <div className="hidden flex-col justify-between rounded-[32px] bg-gradient-to-br from-[#1D4ED8] via-[#2563EB] to-[#0F172A] p-10 text-white shadow-card md:flex">
          <div>
            <div className="flex items-center justify-between rounded-3xl bg-white/10 p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-200">SyncEvent</p>
                <p className="mt-2 text-lg font-semibold">Akses penuh ke event peserta</p>
              </div>
              <span className="rounded-3xl bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-200">2026</span>
            </div>

            <div className="mt-10 space-y-6">
              <div className="rounded-[28px] bg-white/10 p-6">
                <p className="text-sm text-slate-300">Pendaftaran mudah</p>
                <p className="mt-3 text-3xl font-semibold">Akses daftar event dan tiket digital dalam satu akun.</p>
              </div>
              <div className="grid gap-4">
                <div className="space-y-2 rounded-[28px] bg-white/10 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Event</p>
                  <p className="text-2xl font-semibold">Ringkas & Terorganisir</p>
                </div>
                <div className="space-y-2 rounded-[28px] bg-white/10 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Tiket</p>
                  <p className="text-2xl font-semibold">E-Tiket Instan</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto flex items-center gap-3 rounded-3xl bg-white/10 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">SE</div>
            <div>
              <p className="font-semibold">SyncEvent</p>
              <p className="text-sm text-slate-300">Daftar sekarang dan lanjutkan ke dashboard peserta.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
