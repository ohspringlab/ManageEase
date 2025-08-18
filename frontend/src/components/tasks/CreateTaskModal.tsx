import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Calendar, AlertCircle } from "lucide-react";
import api from "../../api/api";

interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
}

const getUsers = async (): Promise<User[]> => {
  const res = await api.get<{ users: User[] }>("/users"); // <-- adjust endpoint if needed
  return res.data.users;
};

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (task: {
    title: string;
    description: string;
    status: "to do" | "in progress" | "completed";
    priority: "low" | "medium" | "high";
    dueDate: string;
    assignedTo: string;
  }) => void;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  onCreateTask,
}: CreateTaskModalProps) {
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    status: "to do" | "in progress" | "completed";
    priority: "low" | "medium" | "high";
    dueDate: string;
    assignedTo: string;
  }>({
    title: "",
    description: "",
    status: "to do",
    priority: "medium",
    dueDate: "",
    assignedTo: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // ✅ Fetch users when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoadingUsers(true);
      getUsers()
        .then((data) =>
          setUsers(
            data.map((user) => {
              user.id = user._id;
              return user;
            })
          )
        )
        .catch((err) => {
          console.error("Failed to load users:", err);
        })
        .finally(() => setLoadingUsers(false));
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    }

    if (!formData.assignedTo) {
      newErrors.assignedTo = "Please assign the task to someone";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onCreateTask(formData);
      setFormData({
        title: "",
        description: "",
        status: "to do",
        priority: "medium",
        dueDate: "",
        assignedTo: "",
      });
      setErrors({});
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      status: "to do",
      priority: "medium",
      dueDate: "",
      assignedTo: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            Create New Task
          </DialogTitle>
          <DialogDescription>
            Add a new task to your list. Fill in the details below to get
            started.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                placeholder="Enter task title..."
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.title}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your task..."
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className={`min-h-[100px] ${
                  errors.description ? "border-destructive" : ""
                }`}
              />
              {errors.description && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: "low" | "medium" | "high") =>
                    setFormData((prev) => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(
                    value: "to do" | "in progress" | "completed"
                  ) => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="to do">To Do</SelectItem>
                    <SelectItem value="in progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      dueDate: e.target.value,
                    }))
                  }
                  className={errors.dueDate ? "border-destructive" : ""}
                  min={new Date().toISOString().split("T")[0]}
                />
                {errors.dueDate && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.dueDate}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assign To *</Label>
              <Select
                value={formData.assignedTo}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, assignedTo: value }))
                }
              >
                <SelectTrigger
                  className={errors.assignedTo ? "border-destructive" : ""}
                >
                  <SelectValue
                    placeholder={
                      loadingUsers ? "Loading users..." : "Select a user"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {users.length === 0 && !loadingUsers && (
                    <SelectItem disabled value="none">
                      No users found
                    </SelectItem>
                  )}
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.assignedTo && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.assignedTo}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
