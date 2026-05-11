import React, { createContext, useContext, useState, useEffect } from 'react';

const API = 'https://cineplex-api-njbq.onrender.com';
const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cineplex_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const savedToken = localStorage.getItem('cineplex_token');
      const savedUser = localStorage.getItem('cineplex_user');
      if (savedToken && savedUser) {
        try {
          const res = await fetch(`${API}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${savedToken}` }
          });
          const data = await res.json();
          if (data.success) {
            setUser(data.user);
            setToken(savedToken);
          } else {
            logout();
          }
        } catch {
          // Use cached user if server unreachable
          setUser(JSON.parse(savedUser));
          setToken(savedToken);
        }
      }
      setLoading(false);
    };
    verifyToken();
  }, []);

  const login = async (credentials) => {
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('cineplex_token', data.token);
        localStorage.setItem('cineplex_user', JSON.stringify(data.user));
      }
      return data;
    } catch (err) {
      return { success: false, message: 'Cannot connect to server: ' + err.message };
    }
  };

  const register = async (userData) => {
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('cineplex_token', data.token);
        localStorage.setItem('cineplex_user', JSON.stringify(data.user));
      }
      return data;
    } catch (err) {
      return { success: false, message: 'Cannot connect to server: ' + err.message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('cineplex_token');
    localStorage.removeItem('cineplex_user');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('cineplex_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
