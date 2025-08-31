import React, { useEffect, useState } from 'react';
import { useTask } from '../contexts/TaskContext';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  CheckSquare,
  Edit,
  Trash2,
  X,
  Users,
  User
} from 'lucide-react';
import { Task, CreateTaskData, TaskFilters, TaskUser, TaskPriority } from '../types/task';
import { UserSelector } from '../components/common/UserSelector';
import { TaskAssignmentBadge } from '../components/tasks/TaskAssignmentBadge';
import toast from 'react-hot-toast';

interface TaskFormData {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  assignedTo?: string;
  tags?: string; // Form input as comma-separated string
  assignedToUser?: TaskUser;
}

export const TasksPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { 
    tasks, 
    loading, 
    filters, 
    setFilters, 
    fetchTasks, 
    createTask, 
    updateTask, 
    deleteTask, 
    toggleTaskStatus 
  } = useTask();

  const [searchParams, setSearchParams] = useSearchParams();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<TaskFormData>();

  const watchAssignedTo = watch('assignedTo');

  // FIRST: Handle URL parameters and initialize filters
  useEffect(() => {
    const shouldCreate = searchParams.get('create');
    const viewParam = searchParams.get('view');
    
    // Handle create parameter
    if (shouldCreate === 'true') {
      setShowCreateModal(true);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('create');
      setSearchParams(newParams, { replace: true });
    }
    
    // Fix 1: Create new filter object instead of function
    if (viewParam && ['assigned', 'created', 'all'].includes(viewParam)) {
      const newFilters: TaskFilters = {
        ...filters,
        view: viewParam as 'all' | 'assigned' | 'created'
      };
      setFilters(newFilters);
    }
    
    setIsInitialized(true);
  }, []); // Remove setFilters from dependencies

  // SECOND: Fetch tasks only after filters are initialized
  useEffect(() => {
    if (isInitialized) {
      fetchTasks();
    }
  }, [filters, isInitialized]);

  // Handle search term changes separately
  useEffect(() => {
    if (!isInitialized) return;
    
    const debounce = setTimeout(() => {
      // Fix 2: Create new filter object instead of function
      const newFilters: TaskFilters = {
        ...filters,
        search: searchTerm
      };
      setFilters(newFilters);
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, isInitialized]); // Add filters to dependencies

  const onSubmit = async (data: TaskFormData) => {
    try {
      // Handle tags conversion with explicit typing
      let tagsArray: string[] = [];
      
      // Explicit check and type assertion
      const tagsInput = data.tags;
      if (tagsInput && typeof tagsInput === 'string' && tagsInput.trim().length > 0) {
        tagsArray = tagsInput
          .split(',')
          .map((tag: string) => tag.trim())
          .filter((tag: string) => tag.length > 0);
      }

      // Create the task data object with correct typing
      const taskData: CreateTaskData = {
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: data.dueDate,
        assignedTo: data.assignedTo || currentUser?.id,
        tags: tagsArray // Now correctly typed as string[]
      };

      if (editingTask) {
        await updateTask(editingTask.id, taskData);
        setEditingTask(null);
        setShowCreateModal(false);
      } else {
        await createTask(taskData);
        setShowCreateModal(false);
      }
      reset();
    } catch (error) {
      // Error handled in context
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setValue('title', task.title);
    setValue('description', task.description || '');
    setValue('priority', task.priority);
    setValue('dueDate', task.dueDate ? task.dueDate.split('T')[0] : '');
    setValue('assignedTo', task.assignedTo?.id || currentUser?.id);
    
    // Safe conversion from string[] to string
    let tagsString = '';
    if (task.tags && Array.isArray(task.tags) && task.tags.length > 0) {
      tagsString = task.tags.join(', ');
    }
    setValue('tags', tagsString);
    
    setShowCreateModal(true);
  };

  const handleDelete = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
    }
  };

  const handleStatusToggle = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'completed' : 'active';
    await toggleTaskStatus(taskId, newStatus as 'active' | 'completed');
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingTask(null);
    reset();
  };

  const handleUserSelect = (userId: string, user: TaskUser) => {
    setValue('assignedTo', userId);
    setValue('assignedToUser', user);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canEditTask = (task: Task) => {
    return task?.userId?.id === currentUser?.id;
  };

  const canUpdateStatus = (task: Task) => {
    return task?.assignedTo?.id === currentUser?.id;
  };

  const getTaskStats = () => {
    if (!Array.isArray(tasks) || !currentUser) {
      return {
        total: 0,
        assignedToMe: 0,
        createdByMe: 0,
        active: 0
      };
    }

    return {
      total: tasks.length,
      assignedToMe: tasks.filter(task => 
        task?.assignedTo?.id === currentUser.id
      ).length,
      createdByMe: tasks.filter(task => 
        task?.userId?.id === currentUser.id
      ).length,
      active: tasks.filter(task => 
        task?.status === 'active'
      ).length
    };
  };

  const stats = getTaskStats();

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="spinner w-8 h-8 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="mt-2 text-gray-600">
            Manage tasks and collaborate with your team.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary btn-md mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Task
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {/* Fix 4: Create new filter objects instead of functions */}
            <select
              value={filters.view}
              onChange={(e) => {
                const newFilters: TaskFilters = {
                  ...filters,
                  view: e.target.value as 'all' | 'assigned' | 'created'
                };
                setFilters(newFilters);
              }}
              className="form-input min-w-32"
            >
              <option value="all">All Tasks</option>
              <option value="assigned">Assigned to Me</option>
              <option value="created">Created by Me</option>
            </select>
            
            <select
              value={filters.status}
              onChange={(e) => {
                const newFilters: TaskFilters = {
                  ...filters,
                  status: e.target.value as 'all' | 'active' | 'completed'
                };
                setFilters(newFilters);
              }}
              className="form-input min-w-28"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
            
            <select
              value={filters.priority}
              onChange={(e) => {
                const newFilters: TaskFilters = {
                  ...filters,
                  priority: e.target.value as 'all' | 'low' | 'medium' | 'high'
                };
                setFilters(newFilters);
              }}
              className="form-input min-w-28"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckSquare className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-lg font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <User className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Assigned to Me</p>
              <p className="text-lg font-semibold text-gray-900">{stats.assignedToMe}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Created by Me</p>
              <p className="text-lg font-semibold text-gray-900">{stats.createdByMe}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-lg font-semibold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="card">
        {loading ? (
          <div className="text-center py-8">
            <div className="spinner w-6 h-6 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading tasks...</p>
          </div>
        ) : !Array.isArray(tasks) || tasks.length === 0 ? (
          <div className="text-center py-8">
            <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-500 mb-6">Create your first task to get started.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary btn-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => {
              if (!task || !task.id) {
                return null;
              }

              return (
                <div
                  key={task.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    task.status === 'completed' ? 'bg-gray-50 opacity-75' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {canUpdateStatus(task) ? (
                        <button
                          onClick={() => handleStatusToggle(task.id, task.status)}
                          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            task.status === 'completed'
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-300 hover:border-blue-600'
                          }`}
                        >
                          {task.status === 'completed' && (
                            <CheckSquare className="h-3 w-3 text-white" />
                          )}
                        </button>
                      ) : (
                        <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
                          task.status === 'completed'
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300'
                        }`}>
                          {task.status === 'completed' && (
                            <CheckSquare className="h-3 w-3 text-white" />
                          )}
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <h3 className={`font-medium ${
                          task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
                        }`}>
                          {task.title || 'Untitled Task'}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-3">
                            <span className={`badge ${getPriorityColor(task.priority || 'medium')}`}>
                              {task.priority || 'medium'}
                            </span>
                            {task.dueDate && (
                              <span className="text-xs text-gray-500 flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                            {Array.isArray(task.tags) && task.tags.length > 0 && (
                              <div className="flex gap-1">
                                {task.tags.slice(0, 2).map((tag: string, index: number) => (
                                  <span key={index} className="badge badge-gray">
                                    {tag}
                                  </span>
                                ))}
                                {task.tags.length > 2 && (
                                  <span className="text-xs text-gray-500">
                                    +{task.tags.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {task.userId && task.assignedTo && (
                            <TaskAssignmentBadge 
                              creator={task.userId} 
                              assignee={task.assignedTo}
                              showCreator={task.userId.id !== task.assignedTo.id}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {canEditTask(task) && (
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(task)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="Edit task"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Delete task"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingTask ? 'Edit Task' : 'Create New Task'}
                    </h3>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="form-label">Title *</label>
                      <input
                        {...register('title', { required: 'Title is required' })}
                        type="text"
                        className="form-input"
                        placeholder="Enter task title"
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="form-label">Description</label>
                      <textarea
                        {...register('description')}
                        rows={3}
                        className="form-input"
                        placeholder="Enter task description"
                      />
                    </div>

                    <div>
                      <label className="form-label">Assign to *</label>
                      <UserSelector
                        selectedUserId={watchAssignedTo || currentUser.id}
                        onSelect={handleUserSelect}
                        placeholder="Select assignee"
                      />
                      <input
                        {...register('assignedTo')}
                        type="hidden"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Priority</label>
                        <select
                          {...register('priority')}
                          className="form-input"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>

                      <div>
                        <label className="form-label">Due Date</label>
                        <input
                          {...register('dueDate')}
                          type="date"
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label">Tags</label>
                      <input
                        {...register('tags')}
                        type="text"
                        className="form-input"
                        placeholder="work, important, urgent (comma separated)"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary btn-md w-full sm:w-auto sm:ml-3"
                  >
                    {isSubmitting ? (
                      <div className="spinner w-4 h-4 border-white mr-2"></div>
                    ) : null}
                    {editingTask ? 'Update Task' : 'Create Task'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn-secondary btn-md w-full sm:w-auto mt-3 sm:mt-0"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
