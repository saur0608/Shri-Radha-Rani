'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken, getAuthToken } from '../lib/api';

interface DevoteeUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: string;
  addresses?: any[];
}

interface AuthContextType {
  user: DevoteeUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phoneOrEmail: string, password: string) => Promise<void>;
  register: (data: { name: string; phone: string; email?: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DevoteeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      const res = await api.getMe();
      if (res.success && res.data) {
        setUser(res.data);
      }
    } catch {
      setAuthToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (phoneOrEmail: string, password: string) => {
    const res = await api.login({ phoneOrEmail, password });
    if (res.success && res.data) {
      setAuthToken(res.data.token);
      setUser(res.data.user);
      // Automatically merge guest cart with user account!
      try {
        await api.mergeCart();
      } catch (e) {
        console.warn('Could not merge cart:', e);
      }
    }
  };

  const register = async (data: { name: string; phone: string; email?: string; password: string }) => {
    const res = await api.register(data);
    if (res.success && res.data) {
      setAuthToken(res.data.token);
      setUser(res.data.user);
      try {
        await api.mergeCart();
      } catch (e) {
        console.warn('Could not merge cart:', e);
      }
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.warn('Logout error', e);
    } finally {
      setAuthToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
