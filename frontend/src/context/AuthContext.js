import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AuthContext = createContext(null);

const TOKEN_KEY = 'chatbot_token';
const USER_KEY = 'chatbot_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage and validate token
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      // Validate token with backend
      axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      }).catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      if (!data || !data.token || !data.user) {
        throw new Error('Invalid response from server');
      }
      const { token: newToken, user: userData } = data;
      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return data;
    } catch (error) {
      if (error.response) {
        // Server responded with error
        throw error;
      } else if (error.request) {
        // Request made but no response
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      } else {
        // Error setting up request
        throw new Error(error.message || 'Login failed');
      }
    }
  };

  const signup = async (email, password, name) => {
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/signup`, { email, password, name });
      if (!data || !data.token || !data.user) {
        throw new Error('Invalid response from server');
      }
      const { token: newToken, user: userData } = data;
      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return data;
    } catch (error) {
      if (error.response) {
        // Server responded with error
        throw error;
      } else if (error.request) {
        // Request made but no response
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      } else {
        // Error setting up request
        throw new Error(error.message || 'Signup failed');
      }
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);
