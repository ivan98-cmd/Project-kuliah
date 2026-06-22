'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CalendarDays, MapPin, Users } from 'lucide-react';
import { Sidebar } from '../layout/Sidebar';
import { useAuth } from '../auth/AuthContext';

interface EventCard {
  id: number;
  nama_event: string;
  tanggal: string;
  lokasi: string;
  deskripsi: string;
  kuota: number;
  poster: string;
  rundown: string[];
  terdaftar: number;
  sisaKuota: number;
}

interface ParticipantItem {
  id: number;
  user_id: number;
  event_id: number;
  nomor_tiket: string;
  status_pendaftaran: string;
  status_kehadiran: string;
  nama_lengkap: string;
  email: string;
  nomor_hp: string;
  instansi: string;
  created_at: string;
  event_name: string;
  tanggal: string;
  lokasi: string;
  poster: string;
}

const defaultForm = {
  nama_lengkap: '',
  email: '',
  nomor_hp: '',
  instansi: '',
};

export default function PesertaPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Beranda');
  const [events, setEvents] = useState<EventCard[]>([]);
  const [participants, setParticipants] = useState<ParticipantItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventCard | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<ParticipantItem | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    fetchEvents();
    fetchParticipants();
  }, [user]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchParticipants = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/participants?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setParticipants(data);
        setSelectedTicket(data[0] ?? null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectEvent = (event: EventCard) => {
    setSelectedEvent(event);
    setForm({
      nama_lengkap: user?.name ?? '',
      email: user?.email ?? '',
      nomor_hp: '',
      instansi: '',
    });
    setMessage('');
    setError('');
  };

  const handleRegister = async () => {
    if (!selectedEvent) return;
    if (!form.nama_lengkap || !form.email || !form.nomor_hp || !form.instansi) {
      setError('Semua field wajib diisi.');
      return;
    }
    if (!form.email.includes('@')) {
      setError('Email tidak valid.');
      return;
    }
    if (selectedEvent.sisaKuota <= 0) {
      setError('Kuota peserta sudah penuh.');
      return;
    }

    setError('');
    setIsSaving(true);

    try {
      const response = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          event_id: selectedEvent.id,
          nama_lengkap: form.nama_lengkap,
          email: form.email,
          nomor_hp: form.nomor_hp,
          instansi: form.instansi,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message || 'Gagal mendaftar event.');
        return;
      }
      setMessage('Pendaftaran berhasil. E-Tiket sudah tersedia.');
      fetchEvents();
      fetchParticipants();
      setActiveTab('Event Saya');
    } catch (err) {
      setError('Terjadi kesalahan pendaftaran.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderContent = () => {
    if (activeTab === 'Beranda') {
      return (
        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-8 shadow-card">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Beranda Peserta</p>
            <h1 className="mt-4 text-4xl font-semibold text-white">Selamat datang, {user?.name}</h1>
            <p className="mt-3 text-slate-400">Telusuri event terbaru dan lihat status pendaftaranmu dengan cepat.</p>
          </div>
          <div className="grid gap-6 xl:grid-cols-3">
            <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
              <p className="text-sm text-slate-400">Event Tersedia</p>
              <p className="mt-4 text-3xl font-semibold text-white">{events.length}</p>
            </div>
            <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
              <p className="text-sm text-slate-400">Daftar Sekarang</p>
              <p className="mt-4 text-3xl font-semibold text-white">{events.filter((event) => event.sisaKuota > 0).length}</p>
            </div>
            <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
              <p className="text-sm text-slate-400">Event Saya</p>
              <p className="mt-4 text-3xl font-semibold text-white">{participants.length}</p>
            </div>
          </div>
          <div className="grid gap-6 xl:grid-cols-3">
            {events.slice(0, 3).map((event) => (
              <div key={event.id} className="overflow-hidden rounded-[32px] border border-white/10 bg-[#1f173d]/80 shadow-card">
                <img src={event.poster} alt={event.nama_event} className="h-44 w-full object-cover" />
                <div className="p-6">
                  <p className="text-sm text-slate-400">{event.tanggal} • {event.lokasi}</p>
                  <h3 className="mt-4 text-xl font-semibold text-white">{event.nama_event}</h3>
                  <p className="mt-3 text-slate-300 line-clamp-3">{event.deskripsi}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === 'Daftar Event') {
      return (
        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Daftar Event</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">Pilih event untuk didaftarkan</h2>
            <p className="mt-2 text-slate-400">Lihat event yang masih memiliki kuota dan segera daftarkan diri Anda.</p>
          </div>
          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <div className="space-y-6">
              {events.map((event) => (
                <div key={event.id} className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-400">{event.tanggal} • {event.lokasi}</p>
                      <h3 className="mt-3 text-2xl font-semibold text-white">{event.nama_event}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectEvent(event)}
                      className="rounded-3xl border border-slate-700 bg-transparent px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-[#7C53F2] hover:text-white">
                      Daftar
                    </button>
                  </div>
                  <p className="mt-4 text-slate-300">{event.deskripsi}</p>
                </div>
              ))}
            </div>
            <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Form Pendaftaran</p>
              {selectedEvent ? (
                <div className="mt-6 space-y-4">
                  <h3 className="text-xl font-semibold text-white">{selectedEvent.nama_event}</h3>
                  <p className="text-sm text-slate-400">{selectedEvent.tanggal} • {selectedEvent.lokasi}</p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-slate-400">Nama lengkap</label>
                      <input
                        value={form.nama_lengkap}
                        onChange={(e) => setForm({ ...form, nama_lengkap: e.target.value })}
                        className="mt-2 w-full rounded-3xl border border-slate-700 bg-[#14102e] px-4 py-3 text-sm text-slate-100 outline-none"
                        placeholder="Nama lengkap" />
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Email</label>
                      <input
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="mt-2 w-full rounded-3xl border border-slate-700 bg-[#14102e] px-4 py-3 text-sm text-slate-100 outline-none"
                        placeholder="Email" />
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Nomor HP</label>
                      <input
                        value={form.nomor_hp}
                        onChange={(e) => setForm({ ...form, nomor_hp: e.target.value })}
                        className="mt-2 w-full rounded-3xl border border-slate-700 bg-[#14102e] px-4 py-3 text-sm text-slate-100 outline-none"
                        placeholder="0812xxxx" />
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Instansi</label>
                      <input
                        value={form.instansi}
                        onChange={(e) => setForm({ ...form, instansi: e.target.value })}
                        className="mt-2 w-full rounded-3xl border border-slate-700 bg-[#14102e] px-4 py-3 text-sm text-slate-100 outline-none"
                        placeholder="Universitas / Perusahaan" />
                    </div>
                    {error ? <p className="text-sm text-rose-400">{error}</p> : null}
                    {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
                    <button
                      type="button"
                      onClick={handleRegister}
                      disabled={isSaving}
                      className="w-full rounded-3xl bg-[#5C4BD5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#7C53F2] disabled:cursor-not-allowed disabled:opacity-50">
                      {isSaving ? 'Mendaftar...' : 'Daftar Sekarang'}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-slate-300">Pilih event terlebih dahulu untuk melihat formulir pendaftaran.</p>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'Event Saya') {
      return (
        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Event Saya</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">Daftar keikutsertaan</h2>
            <p className="mt-2 text-slate-400">Lihat status pendaftaran dan detail tiket event Anda.</p>
          </div>
          {participants.length === 0 ? (
            <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-10 text-center text-slate-300 shadow-card">
              <p className="text-lg font-semibold text-white">Belum ada pendaftaran event.</p>
              <p className="mt-3">Silakan daftar event agar bisa melihat detail keikutsertaan Anda.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {participants.map((participant) => (
                <div key={participant.id} className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{participant.event_name}</p>
                      <h3 className="mt-2 text-2xl font-semibold text-white">{participant.tanggal}</h3>
                      <p className="mt-2 text-slate-300">{participant.lokasi}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-3xl bg-slate-950/70 px-4 py-2 text-sm text-slate-200">{participant.status_pendaftaran}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedTicket(participant)}
                        className="rounded-3xl border border-slate-700 bg-transparent px-4 py-2 text-sm text-slate-200 transition hover:border-[#7C53F2] hover:text-white">
                        Lihat Detail Peserta
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'E-Tiket') {
      return selectedTicket ? (
        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">E-Tiket</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">Tiket Digitalmu</h2>
            <p className="mt-2 text-slate-400">Tunjukkan tiket ini saat masuk ke lokasi event.</p>
          </div>
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-10 shadow-card">
              <div className="rounded-[32px] bg-gradient-to-br from-[#4c1d95] via-[#6d3ae3] to-[#1b1464] p-8 text-white shadow-2xl">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-200">E-Tiket</p>
                    <p className="mt-2 text-3xl font-semibold">{selectedTicket.event_name}</p>
                  </div>
                  <span className="rounded-3xl bg-white/10 px-4 py-2 text-sm text-slate-100">{selectedTicket.tanggal}</span>
                </div>

                <div className="mt-8 grid gap-6 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Nama Peserta</p>
                    <p className="mt-2 text-xl font-semibold">{selectedTicket.nama_lengkap}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Nomor Tiket</p>
                    <p className="mt-2 text-xl font-semibold">{selectedTicket.nomor_tiket}</p>
                  </div>
                </div>

                <div className="mt-8 space-y-4 rounded-3xl bg-white/10 p-6 text-slate-100">
                  <div className="flex items-center justify-between">
                    <span>Lokasi</span>
                    <span className="font-semibold">{selectedTicket.lokasi}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Status</span>
                    <span className="font-semibold">{selectedTicket.status_pendaftaran}</span>
                  </div>
                  <div className="rounded-[24px] border border-white/10 bg-[#0c0820] p-4 text-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code?size=180x180&data=${encodeURIComponent(selectedTicket.nomor_tiket)}`}
                      alt="QR Code Tiket"
                      className="mx-auto"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Detail Tiket</p>
                <div className="mt-6 space-y-4">
                  <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-4">
                    <p className="text-sm text-slate-400">Email</p>
                    <p className="mt-2 text-sm text-slate-100">{selectedTicket.email}</p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-4">
                    <p className="text-sm text-slate-400">Nomor HP</p>
                    <p className="mt-2 text-sm text-slate-100">{selectedTicket.nomor_hp}</p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-4">
                    <p className="text-sm text-slate-400">Instansi</p>
                    <p className="mt-2 text-sm text-slate-100">{selectedTicket.instansi}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Pilih Tiket</p>
                <div className="mt-4 space-y-3">
                  {participants.map((participant) => (
                    <button
                      key={participant.id}
                      type="button"
                      onClick={() => setSelectedTicket(participant)}
                      className={`w-full rounded-3xl border px-4 py-4 text-left text-sm transition ${selectedTicket?.id === participant.id ? 'border-[#7C53F2] bg-[#5C4BD5]/10 text-white' : 'border-slate-700 bg-slate-950/60 text-slate-200 hover:border-[#7C53F2]'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{participant.event_name}</p>
                          <p className="text-xs text-slate-400">{participant.nomor_tiket}</p>
                        </div>
                        <span className="text-xs text-slate-300">{participant.status_kehadiran}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-10 text-center text-slate-300 shadow-card">
          <p className="text-lg font-semibold text-white">Belum ada tiket tersedia.</p>
          <p className="mt-3">Silakan daftarkan event terlebih dahulu untuk membuat e-tiket.</p>
        </div>
      );
    }

    if (activeTab === 'Profil') {
      return (
        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Profil Peserta</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">Akun Anda</h2>
            <p className="mt-2 text-slate-400">Kelola data pribadi dan lihat ringkasan event Anda.</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-8 shadow-card">
              <dl className="grid gap-6">
                <div>
                  <dt className="text-sm text-slate-400">Nama</dt>
                  <dd className="mt-2 text-xl font-semibold text-white">{user?.name}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-400">Email</dt>
                  <dd className="mt-2 text-xl font-semibold text-white">{user?.email}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-400">Role</dt>
                  <dd className="mt-2 text-xl font-semibold text-white">{user?.role}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-400">Total Event Terdaftar</dt>
                  <dd className="mt-2 text-xl font-semibold text-white">{participants.length}</dd>
                </div>
              </dl>
            </div>
            <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-8 shadow-card">
              <p className="text-sm text-slate-400">Tentang</p>
              <p className="mt-4 leading-7 text-slate-300">Profil peserta SyncEvent menyediakan akses cepat ke event yang didaftarkan, status tiket, dan data pribadi. Pastikan data Anda selalu diperbarui.</p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  if (!isAuthenticated || isLoading) {
    return <div className="min-h-screen bg-[#090519]" />;
  }

  return (
    <div className="min-h-screen bg-[#090519] text-slate-100">
      <div className="flex min-h-screen flex-col xl:flex-row">
        <Sidebar selectedTab={activeTab} onSelect={setActiveTab} />
        <main className="flex-1 p-6 md:p-8 xl:p-10">
          <div className="flex flex-col gap-6 xl:gap-8">
            <header className="flex flex-col gap-6 rounded-[32px] border border-white/10 bg-[#140f33]/80 px-6 py-6 shadow-card backdrop-blur-xl md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-slate-400">/ {activeTab}</p>
                <h1 className="mt-3 text-3xl font-semibold text-white">Halo, {user?.name}</h1>
                <p className="mt-1 text-sm text-slate-400">Kelola pendaftaran event dan tiket Anda dengan cepat.</p>
              </div>
              <div className="flex items-center gap-4">
                <button className="inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-slate-950/80 text-slate-200 transition hover:bg-slate-900">
                  <Bell className="h-5 w-5" />
                </button>
                <div className="relative">
                  <div className="h-11 w-11 rounded-full bg-gradient-to-br from-[#6D28D9] to-[#4338CA]" />
                  <span className="absolute -right-1 -bottom-1 h-3 w-3 rounded-full border border-[#090519] bg-emerald-400" />
                </div>
              </div>
            </header>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
