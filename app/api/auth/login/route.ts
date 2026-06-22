import { NextResponse } from 'next/server';
import { getUserByEmail } from '../../../../lib/server/db';

export async function POST(request: Request) {
  const payload = await request.json();
  const { email, password, role } = payload as {
    email: string;
    password: string;
    role: string;
  };

  const user = await getUserByEmail(email);
  if (!user || user.password !== password || user.role.toLowerCase() !== role.toLowerCase()) {
    return NextResponse.json(
      { message: 'Email, password, atau role tidak sesuai.' },
      { status: 401 }
    );
  }

  const safeUser = {
    id: user.id,
    name: user.nama,
    email: user.email,
    role: user.role,
  };

  const response = NextResponse.json({ user: safeUser });
  response.cookies.set('syncevent-session', JSON.stringify({ id: user.id, role: user.role }), {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
  });

  return response;
}
