import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('sv_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sv_token');
    if (token) {
      authService.getMe()
        .then(({ data }) => {
          setUser(data.user);
          localStorage.setItem('sv_user', JSON.stringify(data.user));
        })
        .catch(() => {
          localStorage.removeItem('sv_token');
          localStorage.removeItem('sv_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('sv_token', token);
    localStorage.setItem('sv_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    try { await authService.logout(); } catch (_) {}
    localStorage.removeItem('sv_token');
    localStorage.removeItem('sv_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
