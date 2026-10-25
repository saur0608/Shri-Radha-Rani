'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken, getAuthToken } from '../lib/api';

export interface DevoteeUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  role: string;
  addresses?: any[];
}

interface AuthContextType {
  user: DevoteeUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phoneOrEmail: string, password: string) => Promise<void>;
  loginWithOtp: (target: string, otp: string) => Promise<void>;
  register: (data: {
    name: string;
    phone: string;
    email: string;
    password: string;
    phoneVerificationToken?: string;
    emailVerificationToken?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setSession: (user: DevoteeUser, token: string) => Promise<void>;
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

  const setSession = async (user: DevoteeUser, token: string) => {
    setAuthToken(token);
    setUser(user);
    try {
      await api.mergeCart();
    } catch (e) {
      console.warn('Could not merge cart:', e);
    }
  };

  const login = async (phoneOrEmail: string, password: string) => {
    const res = await api.login({ phoneOrEmail, password });
    if (res.success && res.data) {
      await setSession(res.data.user, res.data.token);
    }
  };

  const loginWithOtp = async (target: string, otp: string) => {
    const res = await api.loginWithOtp({ target, otp });
    if (res.success && res.data) {
      await setSession(res.data.user, res.data.token);
    }
  };

  const register = async (data: {
    name: string;
    phone: string;
    email: string;
    password: string;
    phoneVerificationToken?: string;
    emailVerificationToken?: string;
  }) => {
    const res = await api.register(data);
    if (res.success && res.data) {
      await setSession(res.data.user, res.data.token);
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
        loginWithOtp,
        register,
        logout,
        refreshProfile: fetchProfile,
        setSession,
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
