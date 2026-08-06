import React, { useState, useEffect } from 'react';
import type { User, AuthResponse } from '../types';
import { apiClient } from '../api/client';
import { AuthContext } from './AuthContext';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('walters_auth_token'));

  const logout = () => {
    localStorage.removeItem('walters_auth_token');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    if (token) {
      apiClient.get<User>('/auth/me')
        .then((res) => setUser(res.data))
        .catch(() => logout());
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const response = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    const { access_token } = response.data;
    
    localStorage.setItem('walters_auth_token', access_token);
    setToken(access_token);

    const userRes = await apiClient.get<User>('/auth/me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    setUser(userRes.data);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'admin',
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};