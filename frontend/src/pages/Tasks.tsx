import { useContext, useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Plus, Calendar, Clock, CheckCircle, Circle, Eye } from "lucide-react";
import { CreateTaskModal } from "../components/tasks/CreateTaskModal";
import { ViewTaskModal } from "../components/tasks/ViewTaskModal";
import api from "../api/api"; // ✅ axios instance
import { AuthContext } from "../context/AuthContext"; // ✅ get currentUser
import { format } from "date-fns";

interface Task {
  _id: string;
  id: string;
  title: string;
  description: string;
  status: "to do" | "in progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate: string;
  createdAt: string;
  assignedTo: {
    _id: string;
    name: string;
    email: string;
  };
  createdBy: string;
}

interface CreateTask {
  title: string;
  description: string;
  status: "to do" | "in progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate: string;
  assignedTo: string;
}

export default function Tasks() {
  const { user } = useContext(AuthContext); // ✅ get logged in user
  const currentUser = user?.id; // backend should return email in user object

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewTaskId, setViewTaskId] = useState<string | null>(null);

  // ✅ Fetch tasks on mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get("/tasks"); 
        setTasks(response.data?.tasks); // assuming backend returns Task[]
      } catch (error) {
        console.error("❌ Failed to fetch tasks:", error.response?.data || error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Filter tasks to show only those assigned to current user
  const myTasks = tasks.filter(task => task.assignedTo._id === currentUser);


  const handleCreateTask = async (taskData: CreateTask) => {
    try {
      const response = await api.post("/tasks", taskData);
      setTasks([response.data, ...tasks]); // push new task
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("❌ Failed to create task:", error.response?.data || error.message);
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
     try {
      await api.put(`/tasks/${updatedTask._id}`, updatedTask);
      setTasks(tasks.map((task) => (task._id === updatedTask._id ? updatedTask : task)));
      setViewTaskId(null);
    } catch (error) {
      console.error("❌ Failed to update task:", error.response?.data || error.message);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((task) => task._id !== taskId));
      setViewTaskId(null);
    } catch (error) {
      console.error("❌ Failed to delete task:", error.response?.data || error.message);
    }
  };

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "in progress":
        return <Clock className="h-5 w-5 text-warning" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return "bg-success/10 text-success border-success/20";
      case "in progress":
        return "bg-warning/10 text-warning border-warning/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium":
        return "bg-warning/10 text-warning border-warning/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const viewTask = tasks.find(task => task._id === viewTaskId);

  if (isLoading) {
    return <p className="text-muted-foreground">Loading tasks...</p>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Tasks</h1>
          <p className="text-muted-foreground">
            Manage and track your tasks efficiently
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Plus className="h-5 w-5" />
          Create Task
        </Button>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-muted-foreground">
              {myTasks.filter(t => t.status === "to do").length}
            </div>
            <p className="text-sm text-muted-foreground">To Do</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-warning">
              {myTasks.filter(t => t.status === "in progress").length}
            </div>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-success">
              {myTasks.filter(t => t.status === "completed").length}
            </div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="space-y-4">
                <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">No tasks yet</h3>
                  <p className="text-muted-foreground">Create your first task to get started!</p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Task
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tasks.map((task) => (
              <Card 
                key={task._id} 
                className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onClick={() => setViewTaskId(task._id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(task.status)}
                      <div>
                        <CardTitle className="text-lg">{task.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {task.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewTaskId(task._id);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className={getStatusColor(task.status)}>
                      {task.status.replace("-", " ")}
                    </Badge>
                    <Badge variant="outline" className={getPriorityColor(task.priority)}>
                      {task.priority} priority
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Due {task.dueDate ? format(new Date(task.dueDate), "dd MMM yyyy") : "—"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTask={handleCreateTask}
      />

      {viewTask && (
        <ViewTaskModal
          task={viewTask}
          isOpen={!!viewTaskId}
          onClose={() => setViewTaskId(null)}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />
      )}
    </div>
  );
}