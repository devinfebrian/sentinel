'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getMeApi } from '@/lib/services/api';

interface User {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  [key: string]: any;
}

interface AuthTokens {
  accessToken?: string;
  refreshToken?: string;
}

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  mustChangePassword: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (authData: { user?: User; mustChangePassword?: boolean; tokens?: AuthTokens }) => void;
  logout: () => void;
  setMustChangePasswordState: (state: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [mustChangePassword, setMustChangePassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('accessToken');
        const storedRefresh = localStorage.getItem('refreshToken');
        const storedUser = localStorage.getItem('user');
        const storedMustChange = localStorage.getItem('mustChangePassword');

        if (storedToken) {
          setTokens({ accessToken: storedToken, refreshToken: storedRefresh || '' });
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
          if (storedMustChange === 'true') {
            setMustChangePassword(true);
          }

          // Verify token with backend
          try {
            const meRes = await getMeApi(storedToken);
            if (meRes?.data?.user) {
              setUser(meRes.data.user);
              localStorage.setItem('user', JSON.stringify(meRes.data.user));
            }
          } catch (e) {
            // Token expired or invalid
            console.warn('Session verification warning:', e);
          }
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = ({
    user: userData,
    mustChangePassword: mustChange = false,
    tokens: tokenData,
  }: {
    user?: User;
    mustChangePassword?: boolean;
    tokens?: AuthTokens;
  }) => {
    if (userData) {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    }
    if (tokenData?.accessToken) {
      setTokens(tokenData);
      localStorage.setItem('accessToken', tokenData.accessToken);
      if (tokenData.refreshToken) {
        localStorage.setItem('refreshToken', tokenData.refreshToken);
      }
    }
    setMustChangePassword(mustChange);
    localStorage.setItem('mustChangePassword', String(mustChange));

    if (mustChange) {
      router.push('/change-password');
    } else {
      router.push('/');
    }
  };

  const logout = () => {
    setUser(null);
    setTokens(null);
    setMustChangePassword(false);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('mustChangePassword');
    router.push('/login');
  };

  const setMustChangePasswordState = (state: boolean) => {
    setMustChangePassword(state);
    localStorage.setItem('mustChangePassword', String(state));
  };

  const isAuthenticated = Boolean(tokens?.accessToken);

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        mustChangePassword,
        isAuthenticated,
        isLoading,
        login,
        logout,
        setMustChangePasswordState,
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
