import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore user + token from localStorage on page load
    const storedUser = localStorage.getItem('aura_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Login failed');

    // Store both user info and JWT token
    localStorage.setItem('aura_user', JSON.stringify(data.user));
    localStorage.setItem('aura_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const signup = async (name, email, password) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Signup failed');

    localStorage.setItem('aura_user', JSON.stringify(data.user));
    localStorage.setItem('aura_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('aura_user');
    localStorage.removeItem('aura_token');
  };

  // Helper: returns Authorization header for authenticated API calls
  const getAuthHeader = () => {
    const token = localStorage.getItem('aura_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading, getAuthHeader }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
