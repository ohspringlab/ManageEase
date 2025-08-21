import React, { createContext, useContext, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { taskService } from "../services/task.service";
import { Task, CreateTaskData, TaskFilters } from "../types/task";

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  filters: TaskFilters;
  setFilters: (filters: TaskFilters) => void;
  fetchTasks: () => Promise<void>;
  createTask: (data: CreateTaskData) => Promise<void>;
  updateTask: (id: string, data: Partial<CreateTaskData>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskStatus: (
    id: string,
    status: "active" | "completed"
  ) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTask must be used within a TaskProvider");
  }
  return context;
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>({
    status: "all",
    priority: "all",
    search: "",
  });

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await taskService.getTasks(filters);
      setTasks(
        response.data.tasks.map((data) => {
          data.id = data._id;
          return data;
        }) || []
      );
    } catch (error: any) {
      toast.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createTask = async (data: CreateTaskData) => {
    try {
      const response = await taskService.createTask(data);
      setTasks((prev) => [response.data.task, ...prev]);
      toast.success("Task created successfully!");
    } catch (error: any) {
      toast.error("Failed to create task");
      throw error;
    }
  };

  const updateTask = async (id: string, data: Partial<CreateTaskData>) => {
    try {
      const response = await taskService.updateTask(id, data);
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? response.data.task : task))
      );
      toast.success("Task updated successfully!");
    } catch (error: any) {
      toast.error("Failed to update task");
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await taskService.deleteTask(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
      toast.success("Task deleted successfully!");
    } catch (error: any) {
      toast.error("Failed to delete task");
    }
  };

  const toggleTaskStatus = async (
    id: string,
    status: "active" | "completed"
  ) => {
    try {
      const response = await taskService.updateTaskStatus(id, status);
      response.data.task.id = response.data.task._id;
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? response.data.task : task))
      );
      toast.success(`Task marked as ${status}`);
    } catch (error: any) {
      toast.error("Failed to update task status");
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        filters,
        setFilters,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
