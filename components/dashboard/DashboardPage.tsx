'use client';
import { Bell, CalendarDays, CheckCircle2, ClipboardList, CreditCard, DollarSign, LayoutDashboard, ListChecks, Mail, MapPin, QrCode, Settings, Sparkles, Ticket, TrendingUp, Users, Wallet, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '../layout/Sidebar';
import { useAuth } from '../auth/AuthContext';
import { BarChartEvents } from '../charts/BarChartEvents';
import { DonutChartBudget } from '../charts/DonutChartBudget';
import { LineChartFinance } from '../charts/LineChartFinance';

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

function isEmailValid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function ActivityIcon({ type }: { type: 'user' | 'dollar' | 'chart' }) {
  if (type === 'user') return <Users className="h-5 w-5 text-slate-300" />;
  if (type === 'dollar') return <DollarSign className="h-5 w-5 text-emerald-300" />;
  return <TrendingUp className="h-5 w-5 text-violet-300" />;
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [events, setEvents] = useState<EventCard[]>([]);
  const [participants, setParticipants] = useState<ParticipantItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventCard | null>(null);
  const [selectedManageEvent, setSelectedManageEvent] = useState<EventCard | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<ParticipantItem | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [eventForm, setEventForm] = useState({
    nama_event: '',
    tanggal: '',
    lokasi: '',
    deskripsi: '',
    poster: '',
    kuota: 0,
    rundown: '',
  });
  const [aiMessages, setAiMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    { role: 'assistant', text: 'Halo! Saya AI Advisor SyncEvent. Tanyakan tentang perencanaan event, peserta, atau laporan.' },
  ]);
  const [aiInput, setAiInput] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isEventSaving, setIsEventSaving] = useState(false);

  const role = user?.role ?? 'Admin';
  const welcomeName = user?.name ?? 'Pengguna';
  const profileEmail = user?.email ?? 'guest@domain.com';

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

  useEffect(() => {
    if (activeTab === 'E-Tiket' && participants.length > 0) {
      setSelectedTicket(participants[0]);
    }
  }, [activeTab, participants]);

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
      const query = user.role === 'Peserta' ? `?userId=${user.id}` : '';
      const response = await fetch(`/api/participants${query}`);
      if (response.ok) {
        const data = await response.json();
        setParticipants(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectEvent = (event: EventCard) => {
    setSelectedEvent(event);
    setMessage('');
    setError('');
    setForm({
      nama_lengkap: user?.name ?? '',
      email: user?.email ?? '',
      nomor_hp: '',
      instansi: '',
    });
  };

  const handleRegister = async () => {
    if (!selectedEvent || !user) return;
    if (!form.nama_lengkap || !form.email || !form.nomor_hp || !form.instansi) {
      setError('Semua field wajib diisi.');
      return;
    }
    if (!isEmailValid(form.email)) {
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
          user_id: user.id,
          event_id: selectedEvent.id,
          nama_lengkap: form.nama_lengkap,
          email: form.email,
          nomor_hp: form.nomor_hp,
          instansi: form.instansi,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.message || 'Gagal mendaftar event');
        return;
      }

      setMessage('Pendaftaran berhasil. E-Tiket sudah tersedia.');
      await fetchEvents();
      await fetchParticipants();
      setActiveTab('Event Saya');
    } catch (err) {
      setError('Terjadi kesalahan pendaftaran.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCheckIn = async (participantId: number) => {
    try {
      const response = await fetch('/api/participants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: participantId, status_kehadiran: 'Hadir' }),
      });
      if (response.ok) {
        await fetchParticipants();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateEvent = async () => {
    if (!eventForm.nama_event || !eventForm.tanggal || !eventForm.lokasi || !eventForm.deskripsi || !eventForm.kuota) {
      setError('Semua field event wajib diisi.');
      return;
    }

    setError('');
    setIsEventSaving(true);

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama_event: eventForm.nama_event,
          tanggal: eventForm.tanggal,
          lokasi: eventForm.lokasi,
          deskripsi: eventForm.deskripsi,
          poster: eventForm.poster || 'https://via.placeholder.com/640x360.png?text=Event+Baru',
          kuota: Number(eventForm.kuota),
          rundown: eventForm.rundown.split('\n').map((item) => item.trim()).filter(Boolean),
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        setError(result.message || 'Gagal membuat event.');
        return;
      }

      setEventForm({ nama_event: '', tanggal: '', lokasi: '', deskripsi: '', poster: '', kuota: 0, rundown: '' });
      await fetchEvents();
      setMessage('Event baru berhasil ditambahkan.');
    } catch (err) {
      setError('Terjadi kesalahan saat menambahkan event.');
    } finally {
      setIsEventSaving(false);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    try {
      const response = await fetch('/api/events', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: eventId }),
      });
      if (response.ok) {
        await fetchEvents();
        setMessage('Event berhasil dihapus.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendAiMessage = async () => {
    if (!aiInput.trim()) {
      return;
    }

    const userMessage = aiInput.trim();
    setAiInput('');
    setAiMessages((current) => [...current, { role: 'user', text: userMessage }]);

    const answer = generateAiResponse(userMessage, events.length, participants.length);
    setTimeout(() => {
      setAiMessages((current) => [...current, { role: 'assistant', text: answer }]);
    }, 300);
  };

  const generateAiResponse = (text: string, eventCount: number, participantCount: number) => {
    const normalized = text.toLowerCase();
    if (normalized.includes('peserta') || normalized.includes('kehadiran')) {
      return `Total peserta saat ini ${participantCount}. Anda bisa menggunakan fitur manajemen peserta untuk memvalidasi kehadiran dan memperbarui status tiket.`;
    }
    if (normalized.includes('event') || normalized.includes('rundown')) {
      return `Terdapat ${eventCount} event terdaftar. Untuk menambah event baru, gunakan form kelola event. Pastikan rundown event jelas agar peserta siap.`;
    }
    if (normalized.includes('laporan') || normalized.includes('keuangan')) {
      return 'Laporan keuangan menunjukkan tren pemasukan stabil. Fokus pada biaya promosi dan konsumsi untuk menjaga margin event.';
    }
    return 'Untuk pertanyaan event, peserta, atau laporan, saya siap membantu Anda merencanakan acara terbaik.';
  };

  const eventSummary = useMemo(() => ({
    total: events.length,
    available: events.filter((item) => item.sisaKuota > 0).length,
    signupCount: participants.length,
  }), [events.length, events, participants.length]);

  const selectedParticipantTicket = selectedTicket ?? participants[0] ?? null;

  const renderPesertaMenuBadge = (label: string) => {
    if (label === 'Event Saya' && participants.length > 0) return participants.length;
    return undefined;
  };

  const renderContent = () => {
    if (role === 'Peserta') {
      if (activeTab === 'Beranda') {
        return (
          <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-8 shadow-card">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Beranda Peserta</p>
                <h2 className="mt-4 text-3xl font-semibold text-white">Selamat datang, {user?.name}</h2>
                <p className="mt-3 text-slate-400">Telusuri event terbaru dan lihat status pendaftaranmu dengan cepat.</p>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-[#0f0b28]/80 p-6">
                    <p className="text-sm text-slate-500">Event Tersedia</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{eventSummary.total}</p>
                  </div>
                  <div className="rounded-3xl bg-[#0f0b28]/80 p-6">
                    <p className="text-sm text-slate-500">Daftar Sekarang</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{eventSummary.available}</p>
                  </div>
                  <div className="rounded-3xl bg-[#0f0b28]/80 p-6">
                    <p className="text-sm text-slate-500">Event Saya</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{participants.length}</p>
                  </div>
                  <div className="rounded-3xl bg-[#0f0b28]/80 p-6">
                    <p className="text-sm text-slate-500">E-Tiket</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{participants.length}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Rangkuman</p>
                <div className="mt-6 space-y-4">
                  <div className="rounded-3xl bg-slate-950/70 p-5">
                    <p className="text-sm text-slate-400">Info terbaru</p>
                    <p className="mt-2 text-xl font-semibold text-white">Akses event dan tiket digitalmu kapan saja.</p>
                  </div>
                  <div className="rounded-3xl bg-slate-950/70 p-5">
                    <p className="text-sm text-slate-400">Pengumuman</p>
                    <p className="mt-2 text-xl font-semibold text-white">Kuota terbatas — pastikan mendaftar lebih awal!</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
              {events.slice(0, 3).map((event) => (
                <div key={event.id} className="overflow-hidden rounded-[32px] border border-white/10 bg-[#1f173d]/80 shadow-card">
                  <img src={event.poster} alt={event.nama_event} className="h-44 w-full object-cover" />
                  <div className="p-6">
                    <p className="text-sm text-slate-400">{event.tanggal} • {event.lokasi}</p>
                    <h3 className="mt-4 text-xl font-semibold text-white">{event.nama_event}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{event.deskripsi}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      if (activeTab === 'Daftar Event') {
        const registeredEventIds = participants.map((participant) => participant.event_id);
        return (
          <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[1.3fr_0.75fr]">
              <div className="space-y-6">
                {events.map((event) => (
                  <div key={event.id} className="overflow-hidden rounded-[32px] border border-white/10 bg-[#1b1639]/80 shadow-card">
                    <div className="relative h-64 overflow-hidden rounded-t-[32px]">
                      <img src={event.poster} alt={event.nama_event} className="h-full w-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-transparent p-4">
                        <p className="text-sm text-slate-200">Sisa kuota {event.sisaKuota} dari {event.kuota}</p>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-slate-300">
                          <CalendarDays className="h-4 w-4" /> {event.tanggal}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-slate-300">
                          <MapPin className="h-4 w-4" /> {event.lokasi}
                        </span>
                      </div>
                      <h3 className="mt-5 text-2xl font-semibold text-white">{event.nama_event}</h3>
                      <p className="mt-4 text-slate-300 line-clamp-3">{event.deskripsi}</p>
                      <div className="mt-6 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleSelectEvent(event)}
                          className="rounded-3xl bg-[#5C4BD5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#7C53F2]">
                          Detail Event
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectEvent(event)}
                          className="rounded-3xl border border-slate-700 bg-transparent px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-[#7C53F2] hover:text-white">
                          Daftar Sekarang
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Ringkasan Pendaftaran</p>
                  <div className="mt-6 space-y-4">
                    <div className="rounded-3xl bg-[#0f0b28]/80 p-5">
                      <p className="text-sm text-slate-400">Event tersedia</p>
                      <p className="mt-3 text-3xl font-semibold text-white">{eventSummary.total}</p>
                    </div>
                    <div className="rounded-3xl bg-[#0f0b28]/80 p-5">
                      <p className="text-sm text-slate-400">Event tersisa kuota</p>
                      <p className="mt-3 text-3xl font-semibold text-white">{eventSummary.available}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Pengumuman</p>
                  <p className="mt-4 text-slate-300">Pilih event dan lengkapi formulir dengan data yang valid. Pastikan kuota masih tersedia sebelum mendaftar.</p>
                </div>
              </div>
            </div>

            {selectedEvent ? (
              <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-2xl space-y-3">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Detail Event</p>
                    <h2 className="text-3xl font-semibold text-white">{selectedEvent.nama_event}</h2>
                    <p className="text-sm text-slate-400">{selectedEvent.tanggal} • {selectedEvent.lokasi}</p>
                    <p className="text-slate-300">{selectedEvent.deskripsi}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedEvent(null)}
                    className="inline-flex items-center gap-2 rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-900">
                    <X className="h-4 w-4" /> Tutup detail
                  </button>
                </div>
                <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-5">
                    <div className="rounded-3xl bg-[#0d0a25]/80 p-6">
                      <p className="text-sm text-slate-400">Rundown</p>
                      <ul className="mt-4 space-y-3 text-slate-300">
                        {selectedEvent.rundown.map((item) => (
                          <li key={item} className="rounded-3xl border border-white/5 bg-slate-950/60 px-4 py-3">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-3xl bg-[#0d0a25]/80 p-5">
                        <p className="text-sm text-slate-400">Kuota</p>
                        <p className="mt-3 text-2xl font-semibold text-white">{selectedEvent.kuota}</p>
                      </div>
                      <div className="rounded-3xl bg-[#0d0a25]/80 p-5">
                        <p className="text-sm text-slate-400">Sisa kuota</p>
                        <p className="mt-3 text-2xl font-semibold text-white">{selectedEvent.sisaKuota}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-3xl bg-[#0d0a25]/80 p-6">
                    <p className="text-sm text-slate-400">Form Pendaftaran</p>
                    <div className="mt-5 space-y-4">
                      <div>
                        <label className="text-sm text-slate-400">Nama lengkap</label>
                        <input value={form.nama_lengkap} onChange={(e) => setForm({ ...form, nama_lengkap: e.target.value })} className="mt-2 w-full rounded-3xl border border-slate-700 bg-[#14102e] px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Nama lengkap" />
                      </div>
                      <div>
                        <label className="text-sm text-slate-400">Email</label>
                        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" className="mt-2 w-full rounded-3xl border border-slate-700 bg-[#14102e] px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Email" />
                      </div>
                      <div>
                        <label className="text-sm text-slate-400">Nomor HP</label>
                        <input value={form.nomor_hp} onChange={(e) => setForm({ ...form, nomor_hp: e.target.value })} className="mt-2 w-full rounded-3xl border border-slate-700 bg-[#14102e] px-4 py-3 text-sm text-slate-100 outline-none" placeholder="0812xxxx" />
                      </div>
                      <div>
                        <label className="text-sm text-slate-400">Instansi</label>
                        <input value={form.instansi} onChange={(e) => setForm({ ...form, instansi: e.target.value })} className="mt-2 w-full rounded-3xl border border-slate-700 bg-[#14102e] px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Universitas / Perusahaan" />
                      </div>
                      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
                      {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
                      <button
                        type="button"
                        onClick={handleRegister}
                        disabled={isSaving || selectedEvent.sisaKuota <= 0}
                        className="w-full rounded-3xl bg-[#5C4BD5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#7C53F2] disabled:cursor-not-allowed disabled:opacity-50">
                        {selectedEvent.sisaKuota <= 0 ? 'Kuota Penuh' : isSaving ? 'Mendaftar...' : 'Daftar Sekarang'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
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
                <p className="mt-3">Silakan buka menu "Daftar Event" untuk memilih event.</p>
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
                          Detail Tiket
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
        if (!selectedParticipantTicket) {
          return (
            <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-10 text-center text-slate-300 shadow-card">
              <p className="text-lg font-semibold text-white">Belum ada tiket tersedia.</p>
              <p className="mt-3">Silakan daftar event terlebih dahulu untuk membuat e-tiket.</p>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">E-Tiket</p>
              <h2 className="mt-4 text-3xl font-semibold text-white">Tiket Digitalmu</h2>
              <p className="mt-2 text-slate-400">Perlihatkan tiket ini saat masuk ke lokasi event.</p>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-10 shadow-card">
                <div className="rounded-[32px] bg-gradient-to-br from-[#4c1d95] via-[#6d3ae3] to-[#1b1464] p-8 text-white shadow-2xl">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-slate-200">E-Tiket</p>
                      <p className="mt-2 text-3xl font-semibold">{selectedParticipantTicket.event_name}</p>
                    </div>
                    <span className="rounded-3xl bg-white/10 px-4 py-2 text-sm text-slate-100">{selectedParticipantTicket.tanggal}</span>
                  </div>

                  <div className="mt-8 grid gap-6 md:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Nama Peserta</p>
                      <p className="mt-2 text-xl font-semibold">{selectedParticipantTicket.nama_lengkap}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Nomor Tiket</p>
                      <p className="mt-2 text-xl font-semibold">{selectedParticipantTicket.nomor_tiket}</p>
                    </div>
                  </div>

                  <div className="mt-8 space-y-4 rounded-3xl bg-white/10 p-6 text-slate-100">
                    <div className="flex items-center justify-between">
                      <span>Lokasi</span>
                      <span className="font-semibold">{selectedParticipantTicket.lokasi}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Status</span>
                      <span className="font-semibold">{selectedParticipantTicket.status_pendaftaran}</span>
                    </div>
                    <div className="rounded-[24px] border border-white/10 bg-[#0c0820] p-4 text-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code?size=180x180&data=${encodeURIComponent(selectedParticipantTicket.nomor_tiket)}`}
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
                      <p className="mt-2 text-sm text-slate-100">{selectedParticipantTicket.email}</p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-4">
                      <p className="text-sm text-slate-400">Nomor HP</p>
                      <p className="mt-2 text-sm text-slate-100">{selectedParticipantTicket.nomor_hp}</p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-4">
                      <p className="text-sm text-slate-400">Instansi</p>
                      <p className="mt-2 text-sm text-slate-100">{selectedParticipantTicket.instansi}</p>
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
                        className={`w-full rounded-3xl border px-4 py-4 text-left text-sm transition ${
                          selectedParticipantTicket?.id === participant.id
                            ? 'border-[#7C53F2] bg-[#5C4BD5]/10 text-white'
                            : 'border-slate-700 bg-slate-950/60 text-slate-200 hover:border-[#7C53F2]'
                        }`}>
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
        );
      }

      if (activeTab === 'Profil') {
        return (
          <div className="space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Profil Peserta</p>
              <h2 className="mt-4 text-3xl font-semibold text-white">Akun {user?.name}</h2>
              <p className="mt-2 text-slate-400">Kelola data akun, email, dan ringkasan event.</p>
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
                    <dt className="text-sm text-slate-400">Event terdaftar</dt>
                    <dd className="mt-2 text-xl font-semibold text-white">{participants.length}</dd>
                  </div>
                </dl>
              </div>
              <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-8 shadow-card">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Tentang</p>
                <p className="mt-4 leading-7 text-slate-300">
                  Profil peserta SyncEvent menyediakan akses cepat ke event yang didaftarkan, status tiket, dan data peserta. Pastikan data Anda selalu diperbarui sebelum mendaftar event.
                </p>
              </div>
            </div>
          </div>
        );
      }
    }

    if (role === 'Event Organizer') {
      if (activeTab === 'Dashboard') {
        return (
          <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-3">
              <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
                <p className="text-sm text-slate-400">Event aktif</p>
                <p className="mt-4 text-3xl font-semibold text-white">{events.length}</p>
              </div>
              <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
                <p className="text-sm text-slate-400">Total peserta</p>
                <p className="mt-4 text-3xl font-semibold text-white">{participants.length}</p>
              </div>
              <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
                <p className="text-sm text-slate-400">Kehadiran terverifikasi</p>
                <p className="mt-4 text-3xl font-semibold text-white">{participants.filter((item) => item.status_kehadiran === 'Hadir').length}</p>
              </div>
            </div>
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <BarChartEvents />
              <div className="space-y-6">
                <DonutChartBudget />
                <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Ringkasan</p>
                  <p className="mt-4 text-sm leading-7 text-slate-300">Kelola event terdaftar, monitor status peserta, dan jadwalkan rundown agar semua peserta mendapatkan pengalaman terbaik.</p>
                </div>
              </div>
            </div>
          </div>
        );
      }

      if (activeTab === 'Kelola Event') {
        return (
          <div className="space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Kelola Event</p>
              <h2 className="mt-4 text-3xl font-semibold text-white">Buat dan kelola event</h2>
              <p className="mt-2 text-slate-400">Tambahkan event baru, lihat detail rundown, dan hapus event tidak aktif.</p>
            </div>
            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-400">Nama Event</label>
                    <input
                      value={eventForm.nama_event}
                      onChange={(e) => setEventForm({ ...eventForm, nama_event: e.target.value })}
                      className="mt-3 w-full rounded-3xl border border-slate-700 bg-[#14102e] px-4 py-3 text-sm text-slate-100 outline-none"
                      placeholder="Contoh: Seminar Pengembangan" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm text-slate-400">Tanggal</label>
                      <input
                        value={eventForm.tanggal}
                        onChange={(e) => setEventForm({ ...eventForm, tanggal: e.target.value })}
                        className="mt-3 w-full rounded-3xl border border-slate-700 bg-[#14102e] px-4 py-3 text-sm text-slate-100 outline-none"
                        placeholder="20 Jun 2026" />
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Lokasi</label>
                      <input
                        value={eventForm.lokasi}
                        onChange={(e) => setEventForm({ ...eventForm, lokasi: e.target.value })}
                        className="mt-3 w-full rounded-3xl border border-slate-700 bg-[#14102e] px-4 py-3 text-sm text-slate-100 outline-none"
                        placeholder="Aula Utama" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Deskripsi</label>
                    <textarea
                      value={eventForm.deskripsi}
                      onChange={(e) => setEventForm({ ...eventForm, deskripsi: e.target.value })}
                      className="mt-3 w-full rounded-3xl border border-slate-700 bg-[#14102e] px-4 py-3 text-sm text-slate-100 outline-none"
                      rows={4}
                      placeholder="Deskripsi singkat event." />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm text-slate-400">Kuota</label>
                      <input
                        type="number"
                        value={eventForm.kuota}
                        onChange={(e) => setEventForm({ ...eventForm, kuota: Number(e.target.value) })}
                        className="mt-3 w-full rounded-3xl border border-slate-700 bg-[#14102e] px-4 py-3 text-sm text-slate-100 outline-none"
                        placeholder="100" />
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Poster URL</label>
                      <input
                        value={eventForm.poster}
                        onChange={(e) => setEventForm({ ...eventForm, poster: e.target.value })}
                        className="mt-3 w-full rounded-3xl border border-slate-700 bg-[#14102e] px-4 py-3 text-sm text-slate-100 outline-none"
                        placeholder="https://..." />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Rundown (baris per kegiatan)</label>
                    <textarea
                      value={eventForm.rundown}
                      onChange={(e) => setEventForm({ ...eventForm, rundown: e.target.value })}
                      className="mt-3 w-full rounded-3xl border border-slate-700 bg-[#14102e] px-4 py-3 text-sm text-slate-100 outline-none"
                      rows={4}
                      placeholder="09:00 Registrasi\n10:00 Sesi utama\n..." />
                  </div>
                  {error ? <p className="text-sm text-rose-400">{error}</p> : null}
                  {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
                  <button
                    type="button"
                    onClick={handleCreateEvent}
                    disabled={isEventSaving}
                    className="rounded-3xl bg-[#5C4BD5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#7C53F2] disabled:cursor-not-allowed disabled:opacity-50">
                    {isEventSaving ? 'Menyimpan...' : 'Tambah Event Baru'}
                  </button>
                </div>
              </div>
              <div className="space-y-6">
                <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Daftar Event</p>
                  <div className="mt-6 space-y-4">
                    {events.map((event) => (
                      <div key={event.id} className="rounded-3xl border border-white/10 bg-slate-950/50 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm text-slate-300">{event.tanggal} • {event.lokasi}</p>
                            <h3 className="mt-2 text-lg font-semibold text-white">{event.nama_event}</h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteEvent(event.id)}
                            className="rounded-3xl border border-rose-500 px-4 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/10">
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      if (activeTab === 'Manajemen Peserta') {
        return (
          <div className="space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Manajemen Peserta</p>
              <h2 className="mt-4 text-3xl font-semibold text-white">Kontrol daftar peserta</h2>
              <p className="mt-2 text-slate-400">Validasi kehadiran dan pantau status pendaftaran peserta setiap event.</p>
            </div>
            <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-slate-200">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400">
                      <th className="px-4 py-4">Nama</th>
                      <th className="px-4 py-4">Event</th>
                      <th className="px-4 py-4">Email</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-4 py-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((participant) => (
                      <tr key={participant.id} className="border-b border-white/10">
                        <td className="px-4 py-4">{participant.nama_lengkap}</td>
                        <td className="px-4 py-4">{participant.event_name}</td>
                        <td className="px-4 py-4">{participant.email}</td>
                        <td className="px-4 py-4">{participant.status_kehadiran}</td>
                        <td className="px-4 py-4 space-x-2">
                          <button
                            type="button"
                            onClick={() => handleCheckIn(participant.id)}
                            className="rounded-3xl bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/20">
                            Tandai Hadir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      }

      if (activeTab === 'Laporan') {
        return (
          <div className="space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Laporan</p>
              <h2 className="mt-4 text-3xl font-semibold text-white">Laporan manajemen event</h2>
              <p className="mt-2 text-slate-400">Lihat ringkasan event, peserta, dan estimasi anggaran untuk membuat keputusan yang lebih cepat.</p>
            </div>
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <BarChartEvents />
              <LineChartFinance />
            </div>
          </div>
        );
      }

      if (activeTab === 'Pengaturan') {
        return (
          <div className="space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Pengaturan</p>
              <h2 className="mt-4 text-3xl font-semibold text-white">Akun dan preferensi</h2>
              <p className="mt-2 text-slate-400">Kelola detail profil dan pengaturan dasar platform.</p>
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
                </dl>
              </div>
              <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-8 shadow-card">
                <p className="text-sm text-slate-400">Support</p>
                <p className="mt-4 leading-7 text-slate-300">Butuh bantuan? Silakan hubungi tim support internal atau periksa dokumentasi event untuk alur validasi peserta.</p>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Dashboard Admin</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">Ringkasan utama platform</h2>
            <p className="mt-2 text-slate-400">Kelola event, laporan, peserta, dan keuangan di satu tempat.</p>
          </div>
        </div>
      );
    }

    if (role === 'Admin') {
      if (activeTab === 'Dashboard') {
        return (
          <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-4">
              <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
                <p className="text-sm text-slate-400">Total Event</p>
                <p className="mt-4 text-3xl font-semibold text-white">{events.length}</p>
              </div>
              <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
                <p className="text-sm text-slate-400">Total Peserta</p>
                <p className="mt-4 text-3xl font-semibold text-white">{participants.length}</p>
              </div>
              <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
                <p className="text-sm text-slate-400">Event Terisi</p>
                <p className="mt-4 text-3xl font-semibold text-white">{events.filter((event) => event.sisaKuota === 0).length}</p>
              </div>
              <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
                <p className="text-sm text-slate-400">Hadir Dikonfirmasi</p>
                <p className="mt-4 text-3xl font-semibold text-white">{participants.filter((item) => item.status_kehadiran === 'Hadir').length}</p>
              </div>
            </div>
            <div className="grid gap-6 xl:grid-cols-[1.8fr_1.2fr]">
              <div className="space-y-6">
                <BarChartEvents />
                <LineChartFinance />
              </div>
              <DonutChartBudget />
            </div>
          </div>
        );
      }

      if (activeTab === 'Kelola Event') {
        return (
          <div className="space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Kelola Event</p>
              <h2 className="mt-4 text-3xl font-semibold text-white">Tambahkan event baru</h2>
              <p className="mt-2 text-slate-400">Konfigurasi event lengkap dengan rundown, kuota, dan poster digital.</p>
            </div>
            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-400">Nama Event</label>
                    <input
                      value={eventForm.nama_event}
                      onChange={(e) => setEventForm({ ...eventForm, nama_event: e.target.value })}
                      className="mt-3 w-full rounded-3xl border border-slate-700 bg-[#14102e] px-4 py-3 text-sm text-slate-100 outline-none"
                      placeholder="Nama event" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm text-slate-400">Tanggal</label>
                      <input
                        value={eventForm.tanggal}
                        onChange={(e) => setEventForm({ ...eventForm, tanggal: e.target.value })}
                        className="mt-3 w-full rounded-3xl border border-slate-700 bg-[#14102e] px-4 py-3 text-sm text-slate-100 outline-none"
                        placeholder="15 Jul 2026" />
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Lokasi</label>
                      <input
                        value={eventForm.lokasi}
                        onChange={(e) => setEventForm({ ...eventForm, lokasi: e.target.value })}
                        className="mt-3 w-full rounded-3xl border border-slate-700 bg-[#14102e] px-4 py-3 text-sm text-slate-100 outline-none"
                        placeholder="Gedung Seminar" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Deskripsi</label>
                    <textarea
                      value={eventForm.deskripsi}
                      onChange={(e) => setEventForm({ ...eventForm, deskripsi: e.target.value })}
                      className="mt-3 w-full rounded-3xl border border-slate-700 bg-[#14102e] px-4 py-3 text-sm text-slate-100 outline-none"
                      rows={4}
                      placeholder="Deskripsi event" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm text-slate-400">Kuota</label>
                      <input
                        type="number"
                        value={eventForm.kuota}
                        onChange={(e) => setEventForm({ ...eventForm, kuota: Number(e.target.value) })}
                        className="mt-3 w-full rounded-3xl border border-slate-700 bg-[#14102e] px-4 py-3 text-sm text-slate-100 outline-none"
                        placeholder="80" />
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Poster URL</label>
                      <input
                        value={eventForm.poster}
                        onChange={(e) => setEventForm({ ...eventForm, poster: e.target.value })}
                        className="mt-3 w-full rounded-3xl border border-slate-700 bg-[#14102e] px-4 py-3 text-sm text-slate-100 outline-none"
                        placeholder="https://..." />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Rundown</label>
                    <textarea
                      value={eventForm.rundown}
                      onChange={(e) => setEventForm({ ...eventForm, rundown: e.target.value })}
                      className="mt-3 w-full rounded-3xl border border-slate-700 bg-[#14102e] px-4 py-3 text-sm text-slate-100 outline-none"
                      rows={4}
                      placeholder="Sesi 1\nSesi 2\n..." />
                  </div>
                  {error ? <p className="text-sm text-rose-400">{error}</p> : null}
                  {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
                  <button
                    type="button"
                    onClick={handleCreateEvent}
                    disabled={isEventSaving}
                    className="rounded-3xl bg-[#5C4BD5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#7C53F2] disabled:cursor-not-allowed disabled:opacity-50">
                    {isEventSaving ? 'Menyimpan...' : 'Tambah Event'}
                  </button>
                </div>
              </div>
              <div className="space-y-6">
                <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Daftar Event</p>
                  <div className="mt-6 space-y-4">
                    {events.map((event) => (
                      <div key={event.id} className="rounded-3xl border border-white/10 bg-slate-950/50 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm text-slate-300">{event.tanggal} • {event.lokasi}</p>
                            <h3 className="mt-2 text-lg font-semibold text-white">{event.nama_event}</h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteEvent(event.id)}
                            className="rounded-3xl border border-rose-500 px-4 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/10">
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      if (activeTab === 'Rundown Acara') {
        return (
          <div className="space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Rundown Acara</p>
              <h2 className="mt-4 text-3xl font-semibold text-white">Detail jadwal event</h2>
              <p className="mt-2 text-slate-400">Lihat rundown setiap event dan pastikan agenda telah ditetapkan.</p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {events.map((event) => (
                <div key={event.id} className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
                  <p className="text-sm text-slate-400">{event.tanggal} • {event.lokasi}</p>
                  <h3 className="mt-4 text-2xl font-semibold text-white">{event.nama_event}</h3>
                  <div className="mt-4 space-y-3">
                    {event.rundown.map((item) => (
                      <div key={item} className="rounded-3xl bg-slate-950/60 p-4 text-slate-200">{item}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      if (activeTab === 'Peserta') {
        return (
          <div className="space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Peserta</p>
              <h2 className="mt-4 text-3xl font-semibold text-white">Data peserta event</h2>
              <p className="mt-2 text-slate-400">Lihat daftar peserta dan status kehadiran untuk memantau pelaksanaan event.</p>
            </div>
            <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-slate-200">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400">
                      <th className="px-4 py-4">Nama</th>
                      <th className="px-4 py-4">Event</th>
                      <th className="px-4 py-4">Email</th>
                      <th className="px-4 py-4">Hadir</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((participant) => (
                      <tr key={participant.id} className="border-b border-white/10">
                        <td className="px-4 py-4">{participant.nama_lengkap}</td>
                        <td className="px-4 py-4">{participant.event_name}</td>
                        <td className="px-4 py-4">{participant.email}</td>
                        <td className="px-4 py-4">{participant.status_kehadiran}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      }

      if (activeTab === 'Keuangan') {
        return (
          <div className="space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Keuangan</p>
              <h2 className="mt-4 text-3xl font-semibold text-white">Intisari keuangan</h2>
              <p className="mt-2 text-slate-400">Pantau anggaran dan pengeluaran untuk setiap event utama.</p>
            </div>
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <LineChartFinance />
              <DonutChartBudget />
            </div>
          </div>
        );
      }

      if (activeTab === 'AI Advisor') {
        return (
          <div className="space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">AI Advisor</p>
              <h2 className="mt-4 text-3xl font-semibold text-white">Bantuan cerdas untuk perencanaan event</h2>
              <p className="mt-2 text-slate-400">Tanyakan tips event, strategi peserta, atau ringkasan laporan secara instan.</p>
            </div>
            <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
              <div className="space-y-4">
                {aiMessages.map((messageItem, index) => (
                  <div key={index} className={`rounded-3xl p-4 ${messageItem.role === 'assistant' ? 'bg-slate-950/80 text-slate-100' : 'bg-slate-900/60 text-slate-200'}`}>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{messageItem.role === 'assistant' ? 'Advisor' : 'Anda'}</p>
                    <p className="mt-2 text-sm leading-7">{messageItem.text}</p>
                  </div>
                ))}

                <div className="flex gap-3">
                  <input
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="Tanyakan tentang peserta, event, atau laporan"
                    className="w-full rounded-3xl border border-slate-700 bg-[#14102e] px-4 py-3 text-sm text-slate-100 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSendAiMessage}
                    className="rounded-3xl bg-[#5C4BD5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#7C53F2]">
                    Kirim
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      }

      if (activeTab === 'Laporan') {
        return (
          <div className="space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Laporan</p>
              <h2 className="mt-4 text-3xl font-semibold text-white">Data lengkap platform</h2>
              <p className="mt-2 text-slate-400">Laporan kinerja event, peserta, dan keuangan dalam satu tampilan.</p>
            </div>
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <BarChartEvents />
              <LineChartFinance />
            </div>
          </div>
        );
      }

      if (activeTab === 'Pengaturan') {
        return (
          <div className="space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Pengaturan</p>
              <h2 className="mt-4 text-3xl font-semibold text-white">Akun administrator</h2>
              <p className="mt-2 text-slate-400">Kelola profil admin dan preferensi platform Anda.</p>
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
                </dl>
              </div>
              <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-8 shadow-card">
                <p className="text-sm text-slate-400">Panduan</p>
                <p className="mt-4 leading-7 text-slate-300">Gunakan menu samping untuk menavigasi dashboard, kelola event, dan cek laporan secara berkala.</p>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Dashboard Admin</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">Ringkasan utama platform</h2>
            <p className="mt-2 text-slate-400">Kelola event, laporan, peserta, dan keuangan di satu tempat.</p>
          </div>
        </div>
      );
    }
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
                <p className="text-sm text-slate-400">/ {role === 'Peserta' ? activeTab : 'Dashboard'}</p>
                <h1 className="mt-3 text-3xl font-semibold text-white">Halo, {welcomeName}</h1>
                <p className="mt-1 text-sm text-slate-400">{profileEmail}</p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-300 shadow-sm">
                  <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-500">🔍</span>
                  <input placeholder="Cari..." className="w-full rounded-3xl bg-transparent pl-10 text-sm text-slate-100 outline-none placeholder:text-slate-500" />
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
              </div>
            </header>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
