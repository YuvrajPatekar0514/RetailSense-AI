import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('retailsense_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('retailsense_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userData = await api.getMe();
          setUser(userData);
          localStorage.setItem('retailsense_user', JSON.stringify(userData));
        } catch (err) {
          console.error("Session restoration failed:", err);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('retailsense_token', res.access_token);
    localStorage.setItem('retailsense_user', JSON.stringify(res.user));
    return res.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('retailsense_token');
    localStorage.removeItem('retailsense_user');
  };

  const hasPermission = (moduleName) => {
    if (!user) return false;
    if (user.role === 'admin' || (user.permissions && user.permissions.includes('*'))) return true;
    return user.permissions ? user.permissions.includes(moduleName) : true;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, hasPermission }}>
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
