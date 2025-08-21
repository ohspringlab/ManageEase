export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'active' | 'completed';
export type TaskView = 'all' | 'assigned' | 'created';

// User type for task assignment
export interface TaskUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  completedAt?: string;
  userId: TaskUser; // Task creator
  assignedTo: TaskUser; // Task assignee (NEW FIELD)
  tags: string[];
  estimatedTime?: number;
  createdAt: string;
  updatedAt: string;
  isOverdue?: boolean;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string;
  assignedTo?: string; // User ID (NEW FIELD)
  tags?: string[];
  estimatedTime?: number;
}

export interface TaskFilters {
  status: 'all' | TaskStatus;
  priority: 'all' | TaskPriority;
  view: TaskView; // NEW FIELD
  search: string;
}

export interface TaskStats {
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  overdueTasks: number;
  assignedToMe: number; // NEW FIELD
  createdByMe: number; // NEW FIELD
  completionRate: number;
  priorityBreakdown: {
    high: number;
    medium: number;
    low: number;
  };
}

export interface TaskFormData {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
  assignedTo: string; // NEW FIELD
  tags: string;
  estimatedTime: number;
}
