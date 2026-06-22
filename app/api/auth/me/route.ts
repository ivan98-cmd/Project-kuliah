import { NextResponse, type NextRequest } from 'next/server';
import { getUserById } from '../../../../lib/server/db';

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get('syncevent-session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const session = JSON.parse(sessionCookie) as { id: number; role: string };
    const user = await getUserById(session.id);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.nama,
        email: user.email,
        role: user.role,
      },
    });
  } catch {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
}
