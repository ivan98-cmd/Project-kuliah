import Link from 'next/link';
import { Lock, Mail, ShieldCheck, User, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

const roles = ['Admin', 'Event Organizer'];

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#100B25] px-6 py-10 text-slate-50 md:px-12 lg:px-16">
      <section className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-6xl items-center gap-16 rounded-[40px] border border-white/10 bg-white/5 p-6 shadow-card backdrop-blur-2xl sm:p-10 lg:p-14">
        <div className="flex-1 space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#3B3086]/20 px-4 py-2 text-sm text-slate-200">
              <Zap className="h-4 w-4 text-[#A78BFA]" />
              SyncEvent • Masuk ke ruang manajemen event
            </div>
            <div>
              <h1 className="text-4xl font-semibold text-white">Selamat datang kembali</h1>
              <p className="max-w-xl text-slate-400">Kelola event, peserta, dan keuangan dalam satu tampilan terintegrasi.</p>
            </div>
          </div>

          <div className="space-y-6 rounded-[32px] bg-[#1D1640] p-8 shadow-card">
            <div className="flex flex-wrap items-center gap-3">
              {roles.map((role) => (
                <button
                  key={role}
                  className="rounded-3xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-[#7C53F2] hover:text-white">
                  {role}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-300">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <Input type="email" placeholder="contoh@domain.com" className="pl-11" />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-300">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <Input type="password" placeholder="Masukkan password" className="pl-11" />
              </div>
            </div>

            <Button className="w-full bg-[#5C4BD5] text-white hover:bg-[#7C53F2]">Masuk ke SyncEvent</Button>
            <p className="text-center text-sm text-slate-500">
              Belum punya akun?{' '}
              <Link href="/dashboard" className="font-semibold text-white underline decoration-[#7C53F2]/30">
                Lihat dashboard demo
              </Link>
            </p>
          </div>
        </div>

        <div className="hidden w-[480px] flex-1 flex-col rounded-[32px] bg-gradient-to-br from-[#3B3086] via-[#605DDD] to-[#1D1640] p-10 text-white shadow-card sm:flex">
          <div className="flex items-center justify-between rounded-3xl bg-white/10 p-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-200">SyncEvent</p>
              <p className="mt-2 text-lg font-semibold">Manajemen Event Modern</p>
            </div>
            <div className="rounded-3xl bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-200">2026</div>
          </div>

          <div className="mt-10 space-y-6">
            <div className="rounded-[28px] bg-white/10 p-6">
              <p className="text-sm text-slate-300">Kontrol penuh pada aktivitas event</p>
              <p className="mt-3 text-3xl font-semibold">Laporan keuangan, peserta, dan jadwal.</p>
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

          <div className="mt-auto flex items-center gap-3 rounded-3xl bg-white/10 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">SE</div>
            <div>
              <p className="font-semibold">SyncEvent</p>
              <p className="text-sm text-slate-300">Platform event premium</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
