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
  login: (email: string, password: string, role: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const storageKey = 'syncevent-auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          window.localStorage.removeItem(storageKey);
        }
      }

      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const result = await response.json();
          const nextUser: UserProfile = result.user;
          setUser(nextUser);
          window.localStorage.setItem(storageKey, JSON.stringify(nextUser));
        }
      } catch {
        // ignore failed restore attempts
      }

      setIsLoading(false);
    };

    init();
  }, []);

  const login = async (email: string, password: string, role: string) => {
    if (!email.includes('@') || password.length < 4 || !role) {
      return false;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
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

  const register = async (name: string, email: string, password: string, role: string) => {
    if (!name || !email.includes('@') || password.length < 4 || !role) {
      return false;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      return response.ok;
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
      register,
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
