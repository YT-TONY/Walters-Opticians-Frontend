//src/context/AuthProvider.tsx

import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { authApi, type LoginPayload, type SignupPayload, type UserProfile } from '../api/auth';

export const AUTH_TOKEN_KEY = 'walters_auth_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  const [loading, setLoading] = useState<boolean>(() => {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  });

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);

    if (token) {
      let isMounted = true;
      authApi.getMe()
        .then((userData) => {
          if (isMounted) setUser(userData);
        })
        .catch(() => {
          if (isMounted) {
            localStorage.removeItem(AUTH_TOKEN_KEY);
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

  const login = async (credentials: LoginPayload): Promise<UserProfile> => {
    const res = await authApi.login(credentials);
    localStorage.setItem(AUTH_TOKEN_KEY, res.access_token);

    const profile = await authApi.getMe();
    setUser(profile);
    return profile;
  };

  const setAuthData = (token: string, userProfile: UserProfile) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    setUser(userProfile);
  };

  const register = async (payload: SignupPayload) => {
    await authApi.signup(payload);
    // Verification required before login
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        loading,
        login,
        register,
        setAuthData,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};