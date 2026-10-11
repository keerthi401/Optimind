import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api, { getAuthToken, setAuthToken } from '../services/api';
import type { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setTokenState] = useState<string | null>(getAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = async () => {
    try {
      const res = await api.auth.getProfile();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
        setAuthToken(null);
        setTokenState(null);
      }
    } catch {
      // Token might be expired
      setUser(null);
      setAuthToken(null);
      setTokenState(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    if (res.success && res.data?.token) {
      setAuthToken(res.data.token);
      setTokenState(res.data.token);
      setUser(res.data.user);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.auth.register({ name, email, password });
    if (res.success && res.data?.token) {
      setAuthToken(res.data.token);
      setTokenState(res.data.token);
      setUser(res.data.user);
    }
  };

  const loginAsGuest = async () => {
    const res = await api.auth.guest();
    if (res.success && res.data?.token) {
      setAuthToken(res.data.token);
      setTokenState(res.data.token);
      setUser(res.data.user);
    }
  };

  const logout = () => {
    setAuthToken(null);
    setTokenState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        loginAsGuest,
        logout,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
