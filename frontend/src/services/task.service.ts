import { apiClient } from './api';
import { Task, CreateTaskData, TaskFilters, TaskStats } from '../types/task';
import { ApiResponse } from '../types/api';

class TaskService {
  async getTasks(filters?: TaskFilters): Promise<ApiResponse<{ tasks: Task[] }>> {
    const searchParams = new URLSearchParams();
    
    if (filters) {
      if (filters.status && filters.status !== 'all') {
        searchParams.append('status', filters.status);
      }
      if (filters.priority && filters.priority !== 'all') {
        searchParams.append('priority', filters.priority);
      }
      if (filters.view && filters.view !== 'all') {
        searchParams.append('view', filters.view);
      }
      if (filters.search) {
        searchParams.append('search', filters.search);
      }
    }

    const queryString = searchParams.toString();
    const url = queryString ? `/tasks?${queryString}` : '/tasks';
    
    const response = await apiClient.get(url);
    return response.data;
  }

  async getTask(id: string): Promise<ApiResponse<{ task: Task }>> {
    const response = await apiClient.get(`/tasks/${id}`);
    return response.data;
  }

  async createTask(data: CreateTaskData): Promise<ApiResponse<{ task: Task }>> {
    const response = await apiClient.post('/tasks', data);
    return response.data;
  }

  async updateTask(id: string, data: Partial<CreateTaskData>): Promise<ApiResponse<{ task: Task }>> {
    const response = await apiClient.put(`/tasks/${id}`, data);
    return response.data;
  }

  async updateTaskStatus(id: string, status: 'active' | 'completed'): Promise<ApiResponse<{ task: Task }>> {
    const response = await apiClient.patch(`/tasks/${id}/status`, { status });
    return response.data;
  }

  async deleteTask(id: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete(`/tasks/${id}`);
    return response.data;
  }

  async getTaskStats(): Promise<ApiResponse<{ stats: TaskStats }>> {
    const response = await apiClient.get('/tasks/stats');
    return response.data;
  }
}

export const taskService = new TaskService();
