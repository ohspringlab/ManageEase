export interface User {
  id: string; // Use 'id' not '_id'
  firstName: string;
  lastName: string;
  email: string;
  createdAt?: string;
  lastActivity?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}
