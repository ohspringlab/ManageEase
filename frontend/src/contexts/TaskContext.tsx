import React, { createContext, useContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { taskService } from '../services/task.service';
import { Task, CreateTaskData, TaskFilters, TaskStats } from '../types/task';

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  stats: TaskStats | null;
  filters: TaskFilters;
  setFilters: (filters: TaskFilters) => void;
  fetchTasks: () => Promise<void>;
  createTask: (data: CreateTaskData) => Promise<void>;
  updateTask: (id: string, data: Partial<CreateTaskData>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskStatus: (id: string, status: 'active' | 'completed') => Promise<void>;
  fetchStats: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({
    status: 'all',
    priority: 'all',
    view: 'all',
    search: ''
  });

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await taskService.getTasks(filters);
      
      // Ensure we always get an array
      const tasksData = response?.data?.tasks || [];
      
      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch tasks';
      toast.error(message);
      console.error('Fetch tasks error:', error);
      console.error('Error response:', error.response);
      
      // Set empty array on error to prevent undefined issues
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createTask = async (data: CreateTaskData) => {
    try {
      const response = await taskService.createTask(data);
      
      if (response?.data?.task) {
        setTasks(prev => [response.data.task, ...prev]);
        toast.success('Task created successfully! 🎉');
        fetchStats();
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create task';
      toast.error(message);
      console.error('Create task error:', error);
      throw error;
    }
  };

  const updateTask = async (id: string, data: Partial<CreateTaskData>) => {
    try {
      const response = await taskService.updateTask(id, data);
      
      if (response?.data?.task) {
        setTasks(prev => prev.map(task => 
          task.id === id ? response.data.task : task
        ));
        toast.success('Task updated successfully! ✅');
        fetchStats();
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update task';
      toast.error(message);
      console.error('Update task error:', error);
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await taskService.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
      toast.success('Task deleted successfully! 🗑️');
      fetchStats();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete task';
      toast.error(message);
      console.error('Delete task error:', error);
    }
  };

  const toggleTaskStatus = async (id: string, status: 'active' | 'completed') => {
    try {
      const response = await taskService.updateTaskStatus(id, status);
      
      if (response?.data?.task) {
        setTasks(prev => prev.map(task => 
          task.id === id ? response.data.task : task
        ));
        
        const message = status === 'completed' 
          ? 'Task completed! Great job! 🎉' 
          : 'Task reactivated! 🔄';
        toast.success(message);
        fetchStats();
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update task status';
      toast.error(message);
      console.error('Toggle task status error:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // Calculate stats from current tasks
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!Array.isArray(tasks) || !currentUser?.id) {
        return;
      }

      const totalTasks = tasks.length;
      const activeTasks = tasks.filter(task => task?.status === 'active').length;
      const completedTasks = tasks.filter(task => task?.status === 'completed').length;
      const overdueTasks = tasks.filter(task => {
        if (!task?.dueDate || task?.status === 'completed') return false;
        return new Date(task.dueDate) < new Date();
      }).length;

      const assignedToMe = tasks.filter(task => task?.assignedTo?.id === currentUser.id).length;
      const createdByMe = tasks.filter(task => task?.userId?.id === currentUser.id).length;

      const statsData: TaskStats = {
        totalTasks,
        activeTasks,
        completedTasks,
        overdueTasks,
        assignedToMe,
        createdByMe,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        priorityBreakdown: {
          high: tasks.filter(task => task?.priority === 'high').length,
          medium: tasks.filter(task => task?.priority === 'medium').length,
          low: tasks.filter(task => task?.priority === 'low').length,
        }
      };

      setStats(statsData);
    } catch (error: any) {
      console.error('Failed to calculate task stats:', error);
    }
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      loading,
      stats,
      filters,
      setFilters,
      fetchTasks,
      createTask,
      updateTask,
      deleteTask,
      toggleTaskStatus,
      fetchStats
    }}>
      {children}
    </TaskContext.Provider>
  );
};
