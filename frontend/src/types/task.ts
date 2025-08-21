export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'active' | 'completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  userId: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string;
  tags?: string[];
}

export interface TaskFilters {
  status: 'all' | TaskStatus;
  priority: 'all' | TaskPriority;
  search: string;
}