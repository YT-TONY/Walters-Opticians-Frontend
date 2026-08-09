// src/context/AuthProvider.tsx
import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { authApi, type LoginPayload, type SignupPayload, type UserProfile } from '../api/auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  
  // Initialize loading based on token existence directly (avoids synchronous setState in effect)
  const [loading, setLoading] = useState<boolean>(() => {
    return !!localStorage.getItem('walters_auth_token');
  });

  useEffect(() => {
    const token = localStorage.getItem('walters_auth_token');
    
    if (token) {
      let isMounted = true;
      authApi.getMe()
        .then((userData) => {
          if (isMounted) setUser(userData);
        })
        .catch(() => {
          if (isMounted) {
            localStorage.removeItem('walters_auth_token');
            setUser(null);
          }
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, []);

  const login = async (credentials: LoginPayload) => {
    const res = await authApi.login(credentials);
    localStorage.setItem('walters_auth_token', res.access_token);
    
    const profile = await authApi.getMe();
    setUser(profile);
  };

  const register = async (payload: SignupPayload) => {
    await authApi.signup(payload);
    await login({ email: payload.email, password: payload.password });
  };

  const logout = () => {
    localStorage.removeItem('walters_auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: !!user?.is_admin,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};