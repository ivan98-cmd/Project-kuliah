import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../components/auth/AuthContext';

export const metadata: Metadata = {
  title: 'SyncEvent',
  description: 'Platform manajemen event untuk Admin dan Event Organizer',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
