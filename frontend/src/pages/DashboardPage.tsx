import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTask } from '../contexts/TaskContext';
import { 
  CheckSquare, 
  Calendar, 
  AlertTriangle, 
  TrendingUp,
  Plus,
  Users,
  UserCheck,
  User
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { TaskAssignmentBadge } from '../components/tasks/TaskAssignmentBadge';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { tasks, fetchTasks, loading } = useTask();

  useEffect(() => {
    fetchTasks();
  }, []);

  // Safe statistics calculation with null checks
  const getStats = () => {
    if (!Array.isArray(tasks) || !user?.id) {
      return {
        total: 0,
        active: 0,
        completed: 0,
        overdue: 0,
        assignedToMe: 0,
        createdByMe: 0
      };
    }

    const safeTasks = tasks.filter(task => task && task.id); // Filter out invalid tasks

    return {
      total: safeTasks.length,
      active: safeTasks.filter(task => task.status === 'active').length,
      completed: safeTasks.filter(task => task.status === 'completed').length,
      overdue: safeTasks.filter(task => {
        if (!task.dueDate || task.status === 'completed') return false;
        try {
          return new Date(task.dueDate) < new Date();
        } catch {
          return false;
        }
      }).length,
      assignedToMe: safeTasks.filter(task => task.assignedTo?.id === user.id).length,
      createdByMe: safeTasks.filter(task => task.userId?.id === user.id).length
    };
  };

  const stats = getStats();

  // Safe task filtering with null checks
  const getFilteredTasks = () => {
    if (!Array.isArray(tasks) || !user?.id) {
      return {
        recentTasks: [],
        myTasks: [],
        delegatedTasks: []
      };
    }

    const safeTasks = tasks.filter(task => task && task.id && task.assignedTo && task.userId);

    return {
      recentTasks: safeTasks.slice(0, 5),
      myTasks: safeTasks.filter(task => task.assignedTo.id === user.id).slice(0, 3),
      delegatedTasks: safeTasks.filter(task => 
        task.userId.id === user.id && task.assignedTo.id !== user.id
      ).slice(0, 3)
    };
  };

  const { recentTasks, myTasks, delegatedTasks } = getFilteredTasks();

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

  // Show loading if user is not loaded yet
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="spinner w-8 h-8 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.firstName}! 👋
        </h1>
        <p className="mt-2 text-gray-600">
          Here's an overview of your tasks and team collaboration.
        </p>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Assigned to Me"
          value={stats.assignedToMe}
          icon={UserCheck}
          color="bg-blue-500"
          description={`${stats.active} active tasks`}
        />
        <StatCard
          title="Created by Me"
          value={stats.createdByMe}
          icon={User}
          color="bg-green-500"
          description="Your tasks"
        />
        <StatCard
          title="Team Tasks"
          value={delegatedTasks.length}
          icon={Users}
          color="bg-purple-500"
          description="Delegated to others"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={TrendingUp}
          color="bg-emerald-500"
          description="Great job!"
        />
        <StatCard
          title="Overdue"
          value={stats.overdue}
          icon={AlertTriangle}
          color="bg-red-500"
          description={stats.overdue > 0 ? "Need attention" : "All caught up!"}
        />
        <StatCard
          title="Total Tasks"
          value={stats.total}
          icon={CheckSquare}
          color="bg-gray-600"
          description="All tasks"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Assigned Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">My Tasks</h3>
            <Link
              to="/tasks?view=assigned"
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="spinner w-6 h-6 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading tasks...</p>
            </div>
          ) : myTasks.length === 0 ? (
            <div className="text-center py-8">
              <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks assigned</h3>
              <p className="text-gray-500">All caught up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myTasks.map((task) => {
                if (!task || !task.id) return null;
                
                return (
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
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {task.title || 'Untitled Task'}
                        </h4>
                        {task.dueDate && (
                          <p className="text-xs text-gray-500 flex items-center mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            Due: {(() => {
                              try {
                                return new Date(task.dueDate).toLocaleDateString();
                              } catch {
                                return 'Invalid date';
                              }
                            })()}
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
                      {task.status || 'active'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Delegated Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Delegated Tasks</h3>
            <Link
              to="/tasks?view=created"
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="spinner w-6 h-6 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading tasks...</p>
            </div>
          ) : delegatedTasks.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No delegated tasks</h3>
              <p className="text-gray-500 mb-4">Start collaborating with your team!</p>
              <Link
                to="/tasks?create=true"
                className="btn-primary btn-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {delegatedTasks.map((task) => {
                if (!task || !task.id || !task.assignedTo || !task.userId) return null;
                
                return (
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
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {task.title || 'Untitled Task'}
                        </h4>
                        <div className="mt-2">
                          <TaskAssignmentBadge 
                            creator={task.userId}
                            assignee={task.assignedTo}
                            size="sm"
                          />
                        </div>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {task.status || 'active'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/tasks?create=true"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-5 w-5 text-blue-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">Create New Task</span>
          </Link>
          <Link
            to="/tasks?view=assigned"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <UserCheck className="h-5 w-5 text-green-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">My Assigned Tasks</span>
          </Link>
          <Link
            to="/tasks?view=created"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="h-5 w-5 text-purple-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">Team Tasks</span>
          </Link>
          <Link
            to="/profile"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <TrendingUp className="h-5 w-5 text-orange-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">View Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
