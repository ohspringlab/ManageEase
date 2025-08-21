import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { authService } from '../services/auth.service';
import { User, LoginCredentials, RegisterData } from '../types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
    
    // Set up automatic token refresh check
    const interval = setInterval(checkTokenExpiry, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const userData = await authService.getCurrentUser();
      setUser(userData.data.user);
    } catch (error) {
      // Token might be expired, try to refresh
      try {
        await refreshTokens();
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const checkTokenExpiry = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      // Decode JWT to check expiry (without verification)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      // Refresh if token expires in the next 2 minutes
      if (payload.exp - currentTime < 120) {
        refreshTokens();
      }
    } catch (error) {
      console.error('Error checking token expiry:', error);
    }
  };

  const refreshTokens = async () => {
    try {
      const response = await authService.refreshToken();
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      
      if (response.data.user) {
        setUser(response.data.user);
      }
      
      console.log('✅ Tokens refreshed automatically');
    } catch (error) {
      throw error;
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      setUser(response.data.user);
      
      toast.success(`Welcome back, ${response.data.user.firstName}! 👋`);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      await authService.register(data);
      toast.success('Account created successfully! Please log in.');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      loading,
      login,
      register,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
