// src/context/AuthContext.ts
import { createContext } from 'react';
import {  type UserProfile, type LoginPayload, type SignupPayload } from '../api/auth';

export interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (credentials: LoginPayload) => Promise<UserProfile>;
  register: (payload: SignupPayload) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);