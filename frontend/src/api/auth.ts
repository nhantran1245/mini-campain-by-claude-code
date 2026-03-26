import { apiClient } from './client';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ApiResponse,
} from '@/types';

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      data
    );
    return response.data.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/register',
      data
    );
    return response.data.data;
  },
};
