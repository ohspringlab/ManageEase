import React, { useEffect, useState } from 'react';
import { useTask } from '../contexts/TaskContext';
import { useForm } from 'react-hook-form';
import { useSearchParams, useNavigate } from 'react-router-dom'; // Add these imports
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  CheckSquare,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import { Task, CreateTaskData, TaskFilters } from '../types/task';
import toast from 'react-hot-toast';

export const TasksPage: React.FC = () => {
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

  const [searchParams, setSearchParams] = useSearchParams(); // Add this
  const navigate = useNavigate(); // Add this
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<CreateTaskData>();

  // Check for 'create' parameter in URL and open modal
  useEffect(() => {
    const shouldCreate = searchParams.get('create');
    if (shouldCreate === 'true') {
      setShowCreateModal(true);
      // Remove the parameter from URL without refreshing
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('create');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams]);

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setFilters({ ...filters, search: searchTerm });
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const onSubmit = async (data: CreateTaskData) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, data);
        setEditingTask(null);
      } else {
        await createTask(data);
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
    setValue('tags', task.tags);
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Rest of your component remains the same...
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="mt-2 text-gray-600">
            Manage your tasks and stay productive.
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

      {/* Rest of your component code remains exactly the same */}
      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
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
          <div className="flex gap-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
              className="form-input"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value as any })}
              className="form-input"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
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
        ) : tasks.length === 0 ? (
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
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 border rounded-lg transition-colors ${
                  task.status === 'completed' ? 'bg-gray-50 opacity-75' : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
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
                    <div className="flex-1">
                      <h3 className={`font-medium ${
                        task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`badge ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        {task.dueDate && (
                          <span className="text-xs text-gray-500 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        {task.tags.length > 0 && (
                          <div className="flex gap-1">
                            {task.tags.slice(0, 3).map((tag, index) => (
                              <span key={index} className="badge badge-gray">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(task)}
                      className="p-1 text-gray-400 hover:text-blue-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
                      <label className="form-label">Title</label>
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
                      <label className="form-label">Tags (comma separated)</label>
                      <input
                        {...register('tags')}
                        type="text"
                        className="form-input"
                        placeholder="work, important, urgent"
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
