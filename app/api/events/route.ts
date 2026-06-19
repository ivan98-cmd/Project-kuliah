import { NextResponse } from 'next/server';
import { addEvent, deleteEvent, getEvents, updateEvent } from '../../../lib/server/db';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const eventId = url.searchParams.get('id');

  if (eventId) {
    const events = await getEvents();
    const event = events.find((item) => item.id === Number(eventId));
    return event ? NextResponse.json(event) : NextResponse.json({ message: 'Event tidak ditemukan' }, { status: 404 });
  }

  const events = await getEvents();
  return NextResponse.json(events);
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const event = await addEvent(payload);
    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Gagal membuat event' }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = await request.json();
    const event = await updateEvent(Number(payload.id), payload);
    return NextResponse.json(event);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Gagal memperbarui event' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const payload = await request.json();
    await deleteEvent(Number(payload.id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Gagal menghapus event' }, { status: 400 });
  }
}
