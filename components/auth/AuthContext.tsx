'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type UserRole = 'Admin' | 'Event Organizer' | 'Peserta';

export interface UserProfile {
  id: number;
  role: UserRole;
  name: string;
  email: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (role: UserRole, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const storageKey = 'syncevent-auth';

const profiles: Record<UserRole, Omit<UserProfile, 'role'>> = {
  Admin: {
    id: 1,
    name: 'Admin EO',
    email: 'admin@universitas.ac.id',
  },
  'Event Organizer': {
    id: 2,
    name: 'Event Organizer',
    email: 'eo@universitas.ac.id',
  },
  Peserta: {
    id: 3,
    name: 'Peserta Demo',
    email: 'peserta@universitas.ac.id',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (role: UserRole, email: string, password: string) => {
    if (!email.includes('@') || password.length < 4) {
      return false;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, email, password }),
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      const nextUser: UserProfile = result.user;
      window.localStorage.setItem(storageKey, JSON.stringify(nextUser));
      setUser(nextUser);
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    window.localStorage.removeItem(storageKey);
    setUser(null);

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch {
      // ignore logout network errors
    }
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
