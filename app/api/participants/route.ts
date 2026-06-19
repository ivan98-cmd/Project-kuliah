import { NextResponse } from 'next/server';
import { addParticipant, deleteParticipant, getParticipants, updateParticipant } from '../../../lib/server/db';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  const eventId = url.searchParams.get('eventId');
  const filters: { userId?: number; eventId?: number } = {};
  if (userId) filters.userId = Number(userId);
  if (eventId) filters.eventId = Number(eventId);
  const participants = await getParticipants(filters);
  return NextResponse.json(participants);
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const participant = await addParticipant(payload);
    return NextResponse.json(participant, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Gagal mendaftar event' }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = await request.json();
    const participant = await updateParticipant(Number(payload.id), payload);
    return NextResponse.json(participant);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Gagal mengubah data peserta' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const payload = await request.json();
    await deleteParticipant(Number(payload.id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Gagal menghapus peserta' }, { status: 400 });
  }
}
