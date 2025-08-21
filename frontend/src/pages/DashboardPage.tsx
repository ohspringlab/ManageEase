import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTask } from '../contexts/TaskContext';
import { 
  CheckSquare, 
  Calendar, 
  AlertTriangle, 
  TrendingUp,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { tasks, fetchTasks, loading } = useTask();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const stats = {
    total: tasks.length,
    active: tasks.filter(task => task.status === 'active').length,
    completed: tasks.filter(task => task.status === 'completed').length,
    overdue: tasks.filter(task => {
      if (!task.dueDate || task.status === 'completed') return false;
      return new Date(task.dueDate) < new Date();
    }).length
  };

  const recentTasks = tasks.slice(0, 5);

  const StatCard = ({ title, value, icon: Icon, color, description }: any) => (
    <div className="card">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="mt-2 text-gray-600">
          Here's an overview of your tasks and productivity.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Tasks"
          value={stats.total}
          icon={CheckSquare}
          color="bg-blue-500"
          description={`${stats.active} active tasks`}
        />
        <StatCard
          title="Active Tasks"
          value={stats.active}
          icon={Calendar}
          color="bg-green-500"
          description="In progress"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={TrendingUp}
          color="bg-purple-500"
          description="Great job!"
        />
        <StatCard
          title="Overdue"
          value={stats.overdue}
          icon={AlertTriangle}
          color="bg-red-500"
          description={stats.overdue > 0 ? "Need attention" : "All caught up!"}
        />
      </div>

      {/* Recent Tasks */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Recent Tasks</h3>
          <Link
            to="/tasks"
            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            View all tasks →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="spinner w-6 h-6 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading tasks...</p>
          </div>
        ) : recentTasks.length === 0 ? (
          <div className="text-center py-8">
            <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
            <p className="text-gray-500 mb-6">Get started by creating your first task.</p>
            <Link
              to="/tasks"
              className="btn-primary btn-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      task.priority === 'high'
                        ? 'bg-red-500'
                        : task.priority === 'medium'
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                  />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {task.title}
                    </h4>
                    {task.dueDate && (
                      <p className="text-xs text-gray-500">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    task.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/tasks?create=true"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-5 w-5 text-blue-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">Create New Task</span>
          </Link>
          <Link
            to="/tasks?status=active"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <CheckSquare className="h-5 w-5 text-green-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">View Active Tasks</span>
          </Link>
          <Link
            to="/profile"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <TrendingUp className="h-5 w-5 text-purple-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">View Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
};