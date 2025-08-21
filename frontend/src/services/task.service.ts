import { apiClient } from './api';
import { CreateTaskData, TaskFilters } from '../types/task';

export const taskService = {
  async getTasks(filters?: TaskFilters) {
    const params: any = {};
    if (filters?.status && filters.status !== 'all') params.status = filters.status;
    if (filters?.priority && filters.priority !== 'all') params.priority = filters.priority;
    if (filters?.search) params.search = filters.search;

    const response = await apiClient.get('/tasks', { params });
    return response.data;
  },

  async createTask(data: CreateTaskData) {
    const response = await apiClient.post('/tasks', data);
    return response.data;
  },

  async updateTask(id: string, data: Partial<CreateTaskData>) {
    const response = await apiClient.put(`/tasks/${id}`, data);
    return response.data;
  },

  async deleteTask(id: string) {
    const response = await apiClient.delete(`/tasks/${id}`);
    return response.data;
  },

  async updateTaskStatus(id: string, status: 'active' | 'completed') {
    const response = await apiClient.patch(`/tasks/${id}/status`, { status });
    return response.data;
  }
};