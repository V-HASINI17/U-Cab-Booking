import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// Set API base URL once at module scope (not on every render)
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ucab_token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem('ucab_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserProfile();
    } else {
      localStorage.removeItem('ucab_token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const res = await axios.get('/users/me');
      if (res.data.success) {
        setUser(res.data.data);
      }
    } catch (err) {
      console.error('Session expired or invalid token:', err.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, isAdmin = false) => {
    const url = isAdmin ? '/admin/login' : '/users/login';
    const res = await axios.post(url, { email, password });
    if (res.data.success) {
      setToken(res.data.data.token);
      setUser(res.data.data);
      return res.data.data;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (payload, isDriver = false) => {
    const requestData = isDriver ? { ...payload, role: 'driver' } : payload;
    const res = await axios.post('/users/register', requestData);
    if (res.data.success) {
      setToken(res.data.data.token);
      setUser(res.data.data);
      return res.data.data;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const registerAdmin = async (payload) => {
    const res = await axios.post('/admin/register', payload);
    if (res.data.success) {
      setToken(res.data.data.token);
      setUser(res.data.data);
      return res.data.data;
    }
    throw new Error(res.data.message || 'Admin registration failed');
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('ucab_token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        registerAdmin,
        logout,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
