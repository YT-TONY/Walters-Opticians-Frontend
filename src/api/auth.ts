// src/api/auth.ts
import { apiClient } from './client';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  full_name?: string;
}

export interface UserProfile {
  id: number;
  email: string;
  full_name?: string;
  role: 'admin' | 'customer'; 
  is_active: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export const authApi = {
  // POST /api/v1/auth/signup
  signup: async (payload: SignupPayload): Promise<UserProfile> => {
    const response = await apiClient.post<UserProfile>('/auth/signup', payload);
    return response.data;
  },

  // POST /api/v1/auth/login
  login: async (payload: LoginPayload): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>('/auth/login', payload);
    return response.data;
  },

  // GET /api/v1/auth/me
  getMe: async (): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>('/auth/me');
    return response.data;
  },
};