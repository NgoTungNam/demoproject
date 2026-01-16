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
    // Check for stored token and user on mount
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user data", error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Mocking login for now if API fails or for demo
      // In a real scenario: const response = await authAPI.login({ email, password });

      // Simulating a successful login response
      // For demo purposes: Admin login
      let userData;
      if (email === 'admin@gmail.com' && password === '123456') {
        userData = {
          id: 1,
          name: 'Admin User',
          email: 'admin@gmail.com',
          role: 'admin',
          token: 'mock-admin-token'
        };
      } else {
        // Default customer login
        userData = {
          id: 2,
          name: 'Customer User',
          email: email,
          role: 'customer',
          token: 'mock-customer-token'
        };
      }

      // Save to local storage
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error("Login failed", error);
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (name, email, password) => {
    try {
      // await authAPI.register({ name, email, password });
      // Auto login after register mock
      const userData = {
        id: Date.now(),
        name: name,
        email: email,
        role: 'customer',
        token: `mock-token-${Date.now()}`
      };
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
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
