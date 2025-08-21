import { apiClient } from './api';
import { ApiResponse } from '../types/api';
import { TaskUser } from '../types/task';

class UserService {
  async getUsers(search?: string): Promise<ApiResponse<{ users: TaskUser[] }>> {
    const params: any = {};
    if (search) {
      params.search = search;
    }
    
    const response = await apiClient.get('/users', { params });
    return response.data;
  }

  async getUserById(id: string): Promise<ApiResponse<{ user: TaskUser }>> {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  }
}

export const userService = new UserService();
