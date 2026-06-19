import fs from 'fs/promises';
import path from 'path';

const storagePath = path.join(process.cwd(), 'data', 'database.json');

export interface UserRecord {
  id: number;
  nama: string;
  email: string;
  password: string;
  role: 'Admin' | 'Event Organizer' | 'Peserta';
}

export interface EventRecord {
  id: number;
  nama_event: string;
  tanggal: string;
  lokasi: string;
  deskripsi: string;
  kuota: number;
  poster: string;
  rundown: string[];
}

export interface ParticipantRecord {
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
}

interface DatabaseSchema {
  users: UserRecord[];
  events: EventRecord[];
  participants: ParticipantRecord[];
}

async function readDatabase(): Promise<DatabaseSchema> {
  const json = await fs.readFile(storagePath, 'utf-8');
  return JSON.parse(json) as DatabaseSchema;
}

async function writeDatabase(data: DatabaseSchema) {
  await fs.writeFile(storagePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getEvents() {
  const db = await readDatabase();
  return db.events.map((event) => {
    const registered = db.participants.filter((participant) => participant.event_id === event.id).length;
    return {
      ...event,
      terdaftar: registered,
      sisaKuota: Math.max(0, event.kuota - registered),
    };
  });
}

export async function getEventById(id: number) {
  const db = await readDatabase();
  return db.events.find((event) => event.id === id) ?? null;
}

export async function getUserByEmail(email: string) {
  const db = await readDatabase();
  return db.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function updateEvent(id: number, updates: Partial<EventRecord>) {
  const db = await readDatabase();
  const index = db.events.findIndex((event) => event.id === id);
  if (index === -1) {
    throw new Error('Event tidak ditemukan');
  }

  db.events[index] = {
    ...db.events[index],
    ...updates,
    id,
  };

  await writeDatabase(db);
  return db.events[index];
}

export async function deleteEvent(id: number) {
  const db = await readDatabase();
  const index = db.events.findIndex((event) => event.id === id);
  if (index === -1) {
    throw new Error('Event tidak ditemukan');
  }

  db.events.splice(index, 1);
  await writeDatabase(db);
  return true;
}

export async function getParticipants(filters?: { userId?: number; eventId?: number }) {
  const db = await readDatabase();
  const filtered = db.participants.filter((participant) => {
    if (filters?.userId && participant.user_id !== filters.userId) return false;
    if (filters?.eventId && participant.event_id !== filters.eventId) return false;
    return true;
  });

  return filtered.map((participant) => {
    const event = db.events.find((item) => item.id === participant.event_id);
    return {
      ...participant,
      event_name: event?.nama_event ?? 'Tidak diketahui',
      tanggal: event?.tanggal ?? '-',
      lokasi: event?.lokasi ?? '-',
      event_deskripsi: event?.deskripsi ?? '-',
      poster: event?.poster ?? '',
    };
  });
}

export async function addParticipant(data: {
  user_id: number;
  event_id: number;
  nama_lengkap: string;
  email: string;
  nomor_hp: string;
  instansi: string;
}) {
  const db = await readDatabase();
  const event = db.events.find((item) => item.id === data.event_id);
  if (!event) {
    throw new Error('Event tidak ditemukan');
  }

  const registeredCount = db.participants.filter((participant) => participant.event_id === data.event_id).length;
  if (registeredCount >= event.kuota) {
    throw new Error('Kuota peserta sudah penuh');
  }

  const alreadyRegistered = db.participants.some(
    (participant) => participant.user_id === data.user_id && participant.event_id === data.event_id
  );
  if (alreadyRegistered) {
    throw new Error('Anda sudah terdaftar pada event ini');
  }

  const nextId = db.participants.length ? Math.max(...db.participants.map((item) => item.id)) + 1 : 1;
  const nomorTiket = `SE-${data.event_id}-${Date.now().toString().slice(-6)}`;
  const participant: ParticipantRecord = {
    id: nextId,
    user_id: data.user_id,
    event_id: data.event_id,
    nama_lengkap: data.nama_lengkap,
    email: data.email,
    nomor_hp: data.nomor_hp,
    instansi: data.instansi,
    nomor_tiket: nomorTiket,
    status_pendaftaran: 'Terdaftar',
    status_kehadiran: 'Belum hadir',
    created_at: new Date().toISOString(),
  };

  db.participants.push(participant);
  await writeDatabase(db);
  return participant;
}

export async function updateParticipant(id: number, updates: Partial<ParticipantRecord>) {
  const db = await readDatabase();
  const index = db.participants.findIndex((participant) => participant.id === id);
  if (index === -1) {
    throw new Error('Peserta tidak ditemukan');
  }

  db.participants[index] = {
    ...db.participants[index],
    ...updates,
  };
  await writeDatabase(db);
  return db.participants[index];
}

export async function deleteParticipant(id: number) {
  const db = await readDatabase();
  const index = db.participants.findIndex((participant) => participant.id === id);
  if (index === -1) {
    throw new Error('Peserta tidak ditemukan');
  }

  db.participants.splice(index, 1);
  await writeDatabase(db);
  return true;
}

export async function getUserById(id: number) {
  const db = await readDatabase();
  return db.users.find((user) => user.id === id) ?? null;
}

export async function addEvent(data: Omit<EventRecord, 'id'>) {
  const db = await readDatabase();
  const nextId = db.events.length ? Math.max(...db.events.map((item) => item.id)) + 1 : 1;
  const event: EventRecord = { id: nextId, ...data };
  db.events.push(event);
  await writeDatabase(db);
  return event;
}
