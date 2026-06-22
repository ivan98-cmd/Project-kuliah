'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/auth/AuthContext';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (user?.role === 'Admin') {
      router.replace('/admin/dashboard');
    } else if (user?.role === 'Event Organizer') {
      router.replace('/eo/dashboard');
    } else if (user?.role === 'Peserta') {
      router.replace('/peserta/dashboard');
    }
  }, [isAuthenticated, isLoading, router, user]);

  return <div className="min-h-screen bg-[#090519]" />;
}
