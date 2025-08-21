import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

class ApiClient {
  private client: AxiosInstance;
  private refreshingPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Important for cookies
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle token refresh
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Try to refresh the token
            const newToken = await this.refreshAccessToken();
            
            if (newToken) {
              // Update the original request with new token
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            this.handleLogout();
            return Promise.reject(refreshError);
          }
        }

        // Handle other errors
        if (error.response?.status >= 500) {
          toast.error('Server error. Please try again later.');
        } else if (error.response?.status === 403) {
          toast.error('Access denied.');
        } else if (error.code === 'ECONNABORTED') {
          toast.error('Request timeout. Please check your connection.');
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshAccessToken(): Promise<string | null> {
    // Prevent multiple refresh calls
    if (this.refreshingPromise) {
      return this.refreshingPromise;
    }

    this.refreshingPromise = this.performTokenRefresh();
    
    try {
      const token = await this.refreshingPromise;
      return token;
    } finally {
      this.refreshingPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(`${API_URL}/auth/refresh`, {
        refreshToken
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        
        // Update stored tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        console.log('✅ Token refreshed successfully');
        return accessToken;
      }
      
      throw new Error('Token refresh failed');
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      throw error;
    }
  }

  private handleLogout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  }

  // HTTP Methods
  async get<T = any>(url: string, params?: any): Promise<AxiosResponse<T>> {
    return this.client.get(url, { params });
  }

  async post<T = any>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.client.post(url, data);
  }

  async put<T = any>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.client.put(url, data);
  }

  async patch<T = any>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.client.patch(url, data);
  }

  async delete<T = any>(url: string): Promise<AxiosResponse<T>> {
    return this.client.delete(url);
  }
}

export const apiClient = new ApiClient();
export default apiClient;
