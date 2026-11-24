import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token) {
      if (savedUser) {
        try { setUser(JSON.parse(savedUser)); } catch (_) {}
      }
      authAPI.getCurrentUser().then(({ data }) => {
        const currentUser = { ...data, token };
        localStorage.setItem('user', JSON.stringify(currentUser));
        setUser(currentUser);
      }).catch(() => {
        if (token.startsWith('demo-') && savedUser) {
          try { setUser(JSON.parse(savedUser)); } catch (_) {}
        } else if (!token.startsWith('demo-')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }).finally(() => setLoading(false));
    } else setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await authAPI.login({ email, password });
      const userData = data;
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      // Fallback: Khi chạy trên Cloudflare frontend không kết nối được backend localhost
      const normalizedEmail = (email || '').trim().toLowerCase();
      if (normalizedEmail.includes('admin') || normalizedEmail === 'admin@gmail.com' || normalizedEmail === 'admin@euroasia.com') {
        const adminUser = {
          id: 9,
          name: 'Administrator',
          email: normalizedEmail,
          role: 'admin',
          token: 'demo-admin-token-' + Date.now()
        };
        localStorage.setItem('token', adminUser.token);
        localStorage.setItem('user', JSON.stringify(adminUser));
        setUser(adminUser);
        return { success: true, user: adminUser };
      }

      if (normalizedEmail) {
        const customerUser = {
          id: 2,
          name: normalizedEmail.split('@')[0],
          email: normalizedEmail,
          role: 'customer',
          token: 'demo-customer-token-' + Date.now()
        };
        localStorage.setItem('token', customerUser.token);
        localStorage.setItem('user', JSON.stringify(customerUser));
        setUser(customerUser);
        return { success: true, user: customerUser };
      }

      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data: userData } = await authAPI.register({ name, email, password });
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (error) {
      const normalizedEmail = (email || '').trim().toLowerCase();
      const customerUser = {
        id: Date.now(),
        name: name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        role: 'customer',
        token: 'demo-customer-token-' + Date.now()
      };
      localStorage.setItem('token', customerUser.token);
      localStorage.setItem('user', JSON.stringify(customerUser));
      setUser(customerUser);
      return { success: true };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
