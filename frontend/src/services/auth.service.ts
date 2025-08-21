import { apiClient } from './api';
import { LoginCredentials, RegisterData, AuthResponse, User } from '../types/auth';
import { ApiResponse } from '../types/api';

class AuthService {
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse & { refreshToken: string }>> {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  }

  async register(data: RegisterData): Promise<ApiResponse<{ user: User }>> {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  }

  async logout(): Promise<ApiResponse<null>> {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }

  async refreshToken(): Promise<ApiResponse<AuthResponse & { refreshToken: string }>> {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  }
}

export const authService = new AuthService();
