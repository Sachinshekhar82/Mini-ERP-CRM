import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  hasRole: (...roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Synchronous initialization from localStorage for INSTANT frame-0 rendering
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => {
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      try {
        return JSON.parse(cachedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Loading is only true on first boot if token exists but user profile is missing from cache
  const [loading, setLoading] = useState<boolean>(() => {
    const cachedToken = localStorage.getItem('token');
    const cachedUser = localStorage.getItem('user');
    return Boolean(cachedToken && !cachedUser);
  });

  // Non-blocking background session verification
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const verifySession = async () => {
      try {
        const res = await api.get('/auth/me');
        const userData = res.data?.data?.user || res.data?.user || res.data?.data;
        if (isMounted && userData && userData.email) {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (err: any) {
        // If server explicitly returns 401 / 403, invalid session
        if (err.response?.status === 401 || err.response?.status === 403) {
          if (isMounted) logout();
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    
    const authData = res.data?.data || res.data;
    const newToken = authData?.token;
    const userData = authData?.user;

    if (!newToken || !userData) {
      throw new Error('Authentication response did not contain valid token or user profile');
    }

    // Immediately cache both token and user profile
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  const hasRole = (...roles: string[]) => {
    if (!user || !user.role) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
