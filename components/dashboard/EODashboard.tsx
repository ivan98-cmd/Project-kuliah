'use client';

import { Bell, CalendarDays, ClipboardList, Settings, Sparkles, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '../layout/Sidebar';
import { useAuth } from '../auth/AuthContext';
import { BarChartEvents } from '../charts/BarChartEvents';
import { LineChartFinance } from '../charts/LineChartFinance';
import RundownPage from './RundownPage';
import AIEventAssistant from './AIEventAssistant';

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

const defaultEventForm = {
  nama_event: '',
  tanggal: '',
  lokasi: '',
  deskripsi: '',
  poster: '',
  kuota: 0,
  rundown: '',
};

export default function EODashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [events, setEvents] = useState<EventCard[]>([]);
  const [participants, setParticipants] = useState<ParticipantItem[]>([]);
  const [eventForm, setEventForm] = useState(defaultEventForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [aiMessages, setAiMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    { role: 'assistant', text: 'Halo! Saya AI Advisor SyncEvent. Tanyakan tentang perencanaan event, peserta, atau laporan.' },
  ]);
  const [aiInput, setAiInput] = useState('');

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
      const response = await fetch('/api/participants');
      if (response.ok) {
        const data = await response.json();
        setParticipants(data);
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
    setMessage('');
    setIsSaving(true);

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
      const result = await response.json();
      if (!response.ok) {
        setError(result.message || 'Gagal membuat event.');
        return;
      }

      setEventForm(defaultEventForm);
      setMessage('Event berhasil ditambahkan.');
      fetchEvents();
    } catch (err) {
      setError('Terjadi kesalahan saat menambahkan event.');
    } finally {
      setIsSaving(false);
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
        setMessage('Event berhasil dihapus.');
        fetchEvents();
      }
    } catch (err) {
      console.error(err);
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
        fetchParticipants();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateRundown = async (eventId: number, rundown: string[]) => {
    try {
      const response = await fetch('/api/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: eventId, rundown }),
      });
      if (response.ok) {
        fetchEvents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendAiMessage = () => {
    if (!aiInput.trim()) return;

    const userMessage = aiInput.trim();
    setAiInput('');
    setAiMessages((current) => [...current, { role: 'user', text: userMessage }]);

    const answer = generateAiResponse(userMessage);
    setTimeout(() => {
      setAiMessages((current) => [...current, { role: 'assistant', text: answer }]);
    }, 300);
  };

  const generateAiResponse = (text: string) => {
    const normalized = text.toLowerCase();
    if (normalized.includes('peserta') || normalized.includes('kehadiran')) {
      return `Total peserta saat ini ${participants.length}. Anda bisa menggunakan fitur manajemen peserta untuk memvalidasi kehadiran dan memperbarui status tiket.`;
    }
    if (normalized.includes('event') || normalized.includes('rundown')) {
      return `Terdapat ${events.length} event terdaftar. Untuk menambah event baru, gunakan form Kelola Event. Pastikan rundown event jelas agar peserta siap.`;
    }
    if (normalized.includes('laporan')) {
      return 'Laporan event menunjukkan tren partisipasi yang stabil. Pantau event dengan jumlah peserta tertinggi terlebih dahulu.';
    }
    return 'Untuk pertanyaan event, peserta, atau laporan, saya siap membantu Anda merencanakan acara terbaik.';
  };

  const summary = useMemo(
    () => ({
      totalEvents: events.length,
      totalParticipants: participants.length,
      activeEvents: events.filter((event) => event.sisaKuota > 0).length,
      attendees: participants.filter((item) => item.status_kehadiran === 'Hadir').length,
    }),
    [events, participants]
  );

  const renderContent = () => {
    if (activeTab === 'Dashboard') {
      return (
        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-8 shadow-card">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Dashboard Event Organizer</p>
            <h1 className="mt-4 text-4xl font-semibold text-white">Dashboard Event Organizer</h1>
            <p className="mt-3 text-slate-400">Kelola event, peserta, rundown, laporan, dan gunakan AI Assistant dalam satu tempat.</p>
          </div>

          <div className="grid gap-6 xl:grid-cols-4">
            <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
              <p className="text-sm text-slate-400">Total Event</p>
              <p className="mt-4 text-3xl font-semibold text-white">{summary.totalEvents}</p>
            </div>
            <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
              <p className="text-sm text-slate-400">Total Peserta</p>
              <p className="mt-4 text-3xl font-semibold text-white">{summary.totalParticipants}</p>
            </div>
            <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
              <p className="text-sm text-slate-400">Event Aktif</p>
              <p className="mt-4 text-3xl font-semibold text-white">{summary.activeEvents}</p>
            </div>
            <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
              <p className="text-sm text-slate-400">Peserta Hadir</p>
              <p className="mt-4 text-3xl font-semibold text-white">{summary.attendees}</p>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Ringkasan EO</p>
            <p className="mt-4 text-slate-300">Fokus pada event aktif, validasi kehadiran, dan pastikan rundown event siap dijalankan.</p>
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
            <p className="mt-2 text-slate-400">Tambahkan event baru, edit rundown, dan kelola kuota event.</p>
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
                    placeholder="Deskripsi acara" />
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
                    placeholder="09:00 - Registrasi\n10:00 - Sesi pembukaan" />
                </div>
                {error ? <p className="text-sm text-rose-400">{error}</p> : null}
                {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
                <button
                  type="button"
                  onClick={handleCreateEvent}
                  disabled={isSaving}
                  className="rounded-3xl bg-[#5C4BD5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#7C53F2] disabled:cursor-not-allowed disabled:opacity-50">
                  {isSaving ? 'Menyimpan...' : 'Tambah Event'}
                </button>
              </div>
            </div>
            <div className="space-y-6">
              <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Event Saat Ini</p>
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

    if (activeTab === 'Peserta') {
      return (
        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Peserta</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">Manajemen peserta</h2>
            <p className="mt-2 text-slate-400">Pantau status pendaftaran dan kehadiran peserta untuk setiap event.</p>
          </div>
          <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-200">
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
                      <td className="px-4 py-4">{participant.status_pendaftaran}</td>
                      <td className="px-4 py-4">
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

    if (activeTab === 'Rundown Acara') {
      return <RundownPage events={events} onSaveRundown={handleUpdateRundown} />;
    }

    if (activeTab === 'AI Event Assistant') {
      return <AIEventAssistant messages={aiMessages} inputValue={aiInput} onInputChange={setAiInput} onSendMessage={handleSendAiMessage} />;
    }

    if (activeTab === 'Laporan') {
      return (
        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Laporan</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">Laporan EO</h2>
            <p className="mt-2 text-slate-400">Analisis event dan peserta untuk membuat keputusan yang tepat.</p>
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
            <h2 className="mt-4 text-3xl font-semibold text-white">Akun Event Organizer</h2>
            <p className="mt-2 text-slate-400">Kelola profil dan preferensi akun Anda.</p>
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
              <p className="mt-4 leading-7 text-slate-300">Gunakan menu samping untuk mengakses dashboard, manajemen peserta, rundown, dan AI Event Assistant.</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Dashboard</p>
        <h2 className="mt-4 text-3xl font-semibold text-white">Dashboard Event Organizer</h2>
        <p className="mt-2 text-slate-400">Kelola event dan peserta secara efisien dengan fungsi yang terpisah.</p>
      </div>
    );
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
                <p className="text-sm text-slate-400">/ Dashboard</p>
                <h1 className="mt-3 text-3xl font-semibold text-white">Halo, {user?.name}</h1>
                <p className="mt-1 text-sm text-slate-400">Kelola event, peserta, rundown, laporan, dan AI Event Assistant.</p>
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
