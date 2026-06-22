import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

interface SchedulePayload {
  event_id: number;
  title: string;
  schedule_date: string;
  start_time: string;
  end_time: string;
  location: string;
}

function validateSchedule(payload: Partial<SchedulePayload>) {
  if (!payload.event_id || typeof payload.event_id !== 'number') {
    return 'event_id harus berupa angka dan tidak boleh kosong.';
  }

  if (!payload.title || typeof payload.title !== 'string') {
    return 'title harus diisi.';
  }

  if (!payload.schedule_date || typeof payload.schedule_date !== 'string') {
    return 'schedule_date harus diisi.';
  }

  if (!payload.start_time || typeof payload.start_time !== 'string') {
    return 'start_time harus diisi.';
  }

  if (!payload.end_time || typeof payload.end_time !== 'string') {
    return 'end_time harus diisi.';
  }

  if (!payload.location || typeof payload.location !== 'string') {
    return 'location harus diisi.';
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload: Partial<SchedulePayload> = {
      event_id: Number(body.event_id),
      title: String(body.title ?? '').trim(),
      schedule_date: String(body.schedule_date ?? '').trim(),
      start_time: String(body.start_time ?? '').trim(),
      end_time: String(body.end_time ?? '').trim(),
      location: String(body.location ?? '').trim(),
    };

    const validationError = validateSchedule(payload);
    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }

    const insertQuery = `
      INSERT INTO schedules (event_id, title, schedule_date, start_time, end_time, location)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await (pool as any).execute(insertQuery, [
      payload.event_id,
      payload.title,
      payload.schedule_date,
      payload.start_time,
      payload.end_time,
      payload.location,
    ]);

    return NextResponse.json({
      message: 'Jadwal event berhasil disimpan',
      data: {
        id: (result as any).insertId,
        ...payload,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/schedules error:', error);
    return NextResponse.json(
      { message: error?.message ?? 'Terjadi kesalahan saat menyimpan jadwal event' },
      { status: 500 }
    );
  }
}
