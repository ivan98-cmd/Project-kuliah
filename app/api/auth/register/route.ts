import { NextResponse } from 'next/server';
import { addUser, getUserByEmail } from '../../../../lib/server/db';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { name, email, password, role } = payload as {
      name: string;
      email: string;
      password: string;
      role: 'Peserta' | 'Admin' | 'Event Organizer';
    };

    if (!name || !email.includes('@') || password.length < 4) {
      return NextResponse.json({ message: 'Data pendaftaran tidak valid.' }, { status: 400 });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ message: 'Email sudah digunakan.' }, { status: 409 });
    }

    const user = await addUser({ nama: name, email, password, role });
    return NextResponse.json({ user }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error?.message || 'Gagal membuat akun.' }, { status: 500 });
  }
}
