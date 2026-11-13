import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthenticatedUser } from '../types';
import { apiClient } from '../services/apiClient';

interface AuthContextValue {
  user: AuthenticatedUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.getCurrentUser().then(setUser).finally(() => setLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    const result = await apiClient.login(username, password);
    if (result.user) {
      setUser(result.user);
      return null;
    }
    return result.error || 'Không thể đăng nhập.';
  };

  const logout = async () => {
    await apiClient.logout();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth phải được dùng trong AuthProvider');
  return context;
}
