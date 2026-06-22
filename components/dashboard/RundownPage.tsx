'use client';

import { useEffect, useMemo, useState } from 'react';

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

interface RundownPageProps {
  events: EventCard[];
  onSaveRundown: (eventId: number, rundown: string[]) => Promise<void>;
}

export default function RundownPage({ events, onSaveRundown }: RundownPageProps) {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [newItem, setNewItem] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (events.length > 0 && selectedEventId === null) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) ?? null,
    [events, selectedEventId]
  );

  const handleAddItem = async () => {
    if (!selectedEvent || !newItem.trim()) return;
    const updated = [...selectedEvent.rundown, newItem.trim()];
    await saveRundown(updated);
    setNewItem('');
  };

  const handleDeleteItem = async (index: number) => {
    if (!selectedEvent) return;
    const updated = selectedEvent.rundown.filter((_, idx) => idx !== index);
    await saveRundown(updated);
  };

  const handleEditItem = (index: number) => {
    if (!selectedEvent) return;
    setEditIndex(index);
    setEditText(selectedEvent.rundown[index] || '');
  };

  const handleSaveEdit = async () => {
    if (!selectedEvent || editIndex === null || !editText.trim()) return;
    const updated = selectedEvent.rundown.map((item, idx) => (idx === editIndex ? editText.trim() : item));
    await saveRundown(updated);
    setEditIndex(null);
    setEditText('');
  };

  const saveRundown = async (updatedRundown: string[]) => {
    if (!selectedEvent) return;
    setStatus('Menyimpan rundown...');
    await onSaveRundown(selectedEvent.id, updatedRundown);
    setStatus('Rundown berhasil diperbarui.');
    setTimeout(() => setStatus(''), 2500);
  };

  if (!selectedEvent) {
    return (
      <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-10 text-center text-slate-300 shadow-card">
        <p className="text-lg font-semibold text-white">Tidak ada event untuk ditampilkan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Rundown Acara</p>
        <h2 className="mt-4 text-3xl font-semibold text-white">Detail jadwal event</h2>
        <p className="mt-2 text-slate-400">Atur daftar rundown, waktu mulai, nama kegiatan, dan lokasi untuk event Anda.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Pilih Event</p>
          <div className="mt-6 space-y-4">
            {events.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => setSelectedEventId(event.id)}
                className={`w-full rounded-3xl border px-4 py-4 text-left transition ${event.id === selectedEventId ? 'border-[#7C53F2] bg-[#5C4BD5]/10 text-white' : 'border-slate-700 bg-slate-950/60 text-slate-200 hover:border-[#7C53F2]'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{event.nama_event}</p>
                    <p className="text-xs text-slate-400">{event.tanggal} • {event.lokasi}</p>
                  </div>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">{event.sisaKuota} kuota tersisa</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-[#1b1639]/80 p-6 shadow-card">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-400">Event dipilih</p>
              <h3 className="mt-3 text-2xl font-semibold text-white">{selectedEvent.nama_event}</h3>
              <p className="mt-1 text-slate-400">{selectedEvent.tanggal} • {selectedEvent.lokasi}</p>
            </div>
            <div className="rounded-3xl bg-[#0f0b28]/80 p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Jadwal rundown</p>
              <div className="mt-4 space-y-3">
                {selectedEvent.rundown.length === 0 ? (
                  <p className="text-slate-300">Belum ada rundown ditambahkan untuk event ini.</p>
                ) : (
                  selectedEvent.rundown.map((item, index) => (
                    <div key={index} className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-white">{item}</p>
                          <p className="mt-1 text-xs text-slate-500">Waktu awal / akhir dan nama kegiatan dapat ditambahkan di sini.</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditItem(index)}
                            className="rounded-3xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-[#7C53F2] hover:text-white">
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(index)}
                            className="rounded-3xl border border-rose-500 px-3 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/10">
                            Hapus
                          </button>
                        </div>
                      </div>
                      {editIndex === index ? (
                        <div className="mt-3 space-y-3">
                          <input
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full rounded-3xl border border-slate-700 bg-[#14102e] px-4 py-3 text-sm text-slate-100 outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleSaveEdit}
                            className="rounded-3xl bg-[#5C4BD5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#7C53F2]">
                            Simpan Perubahan
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="space-y-4 rounded-3xl bg-[#0f0b28]/80 p-6">
              <label className="text-sm text-slate-400">Tambah rundown</label>
              <textarea
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                rows={3}
                className="w-full rounded-3xl border border-slate-700 bg-[#14102e] px-4 py-3 text-sm text-slate-100 outline-none"
                placeholder="09:00 - Registrasi atau 10:00 - Sesi utama" />
              <button
                type="button"
                onClick={handleAddItem}
                className="rounded-3xl bg-[#5C4BD5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#7C53F2]">
                Tambah Rundown
              </button>
              {status ? <p className="text-sm text-emerald-300">{status}</p> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
