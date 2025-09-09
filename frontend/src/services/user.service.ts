import { apiClient } from './api';
import { ApiResponse } from '../types/api';
import { TaskUser } from '../types/task';

class UserService {
  async getUsers(search?: string): Promise<ApiResponse<{ users: TaskUser[] }>> {
    const searchParams = new URLSearchParams();
    if (search) {
      searchParams.append('search', search);
    }

    const queryString = searchParams.toString();
    const url = queryString ? `/users?${queryString}` : '/users';
    
    const response = await apiClient.get(url);
    return response.data;
  }

  async getUserById(id: string): Promise<ApiResponse<{ user: TaskUser }>> {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  }
}

export const userService = new UserService();
