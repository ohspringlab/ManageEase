import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Task from '../models/Task.model';
import User from '../models/User.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class TaskController {
  // Helper function to transform task data
  private static transformTask(task: any) {
    return {
      id: task._id.toString(),
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      tags: task.tags || [],
      completedAt: task.completedAt,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      userId: task.userId ? {
        id: task.userId._id.toString(),
        firstName: task.userId.firstName,
        lastName: task.userId.lastName,
        email: task.userId.email
      } : null,
      assignedTo: task.assignedTo ? {
        id: task.assignedTo._id.toString(),
        firstName: task.assignedTo.firstName,
        lastName: task.assignedTo.lastName,
        email: task.assignedTo.email
      } : null
    };
  }

  static async getTasks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status, priority, search, view } = req.query;
      const userId = req.user!._id;
      
      let filter: any = {};

      // Filter by view type
      if (view === 'assigned') {
        // Tasks assigned TO me
        filter.assignedTo = userId;
      } else if (view === 'created') {
        // Tasks created BY me
        filter.userId = userId;
      } else {
        // Default: show tasks I'm involved with (created OR assigned to me)
        filter.$or = [
          { userId: userId },
          { assignedTo: userId }
        ];
      }
      
      if (status && status !== 'all') {
        filter.status = status;
      }
      
      if (priority && priority !== 'all') {
        filter.priority = priority;
      }
      
      if (search) {
        filter.$and = [
          filter.$or ? { $or: filter.$or } : {},
          {
            $or: [
              { title: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } }
            ]
          }
        ];
        delete filter.$or;
      }

      const tasks = await Task.find(filter)
        .populate('userId', 'firstName lastName email')
        .populate('assignedTo', 'firstName lastName email')
        .sort({ createdAt: -1 });

      // Transform tasks to match frontend expectations
      const transformedTasks = tasks.map(task => TaskController.transformTask(task));

      res.json({ 
        success: true, 
        data: { tasks: transformedTasks } 
      });
    } catch (error) {
      console.error('Get tasks error:', error);
      next(error);
    }
  }

  static async createTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const taskData = { 
        ...req.body, 
        userId: req.user!._id 
      };

      // If assignedTo is not provided, assign to creator
      if (!taskData.assignedTo) {
        taskData.assignedTo = req.user!._id;
      }

      // Verify assignee exists
      if (taskData.assignedTo !== req.user!._id.toString()) {
        const assignee = await User.findById(taskData.assignedTo);
        if (!assignee) {
          return res.status(400).json({
            success: false,
            message: 'Assigned user not found'
          });
        }
      }

      const task = new Task(taskData);
      await task.save();
      
      // Populate the created task
      await task.populate('userId', 'firstName lastName email');
      await task.populate('assignedTo', 'firstName lastName email');

      // Transform task to match frontend expectations
      const transformedTask = TaskController.transformTask(task);

      res.status(201).json({ 
        success: true, 
        data: { task: transformedTask } 
      });
    } catch (error) {
      console.error('Create task error:', error);
      next(error);
    }
  }

  static async updateTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id;
      const taskId = req.params.id;

      // Find task that user can modify (creator or assignee)
      const existingTask = await Task.findOne({
        _id: taskId,
        $or: [
          { userId: userId },
          { assignedTo: userId }
        ]
      });

      if (!existingTask) {
        return res.status(404).json({
          success: false,
          message: 'Task not found or access denied'
        });
      }

      // Only creator can change assignee
      if (req.body.assignedTo && existingTask.userId.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Only task creator can change assignee'
        });
      }

      // Verify new assignee exists
      if (req.body.assignedTo && req.body.assignedTo !== existingTask.assignedTo.toString()) {
        const assignee = await User.findById(req.body.assignedTo);
        if (!assignee) {
          return res.status(400).json({
            success: false,
            message: 'Assigned user not found'
          });
        }
      }

      const task = await Task.findByIdAndUpdate(
        taskId,
        req.body,
        { new: true }
      )
      .populate('userId', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email');

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      // Transform task to match frontend expectations
      const transformedTask = TaskController.transformTask(task);

      res.json({ 
        success: true, 
        data: { task: transformedTask } 
      });
    } catch (error) {
      console.error('Update task error:', error);
      next(error);
    }
  }

  static async deleteTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id;
      
      // Only creator can delete
      const task = await Task.findOneAndDelete({ 
        _id: req.params.id, 
        userId: userId 
      });
      
      if (!task) {
        return res.status(404).json({ 
          success: false, 
          message: 'Task not found or access denied' 
        });
      }
      
      res.json({ 
        success: true, 
        message: 'Task deleted successfully' 
      });
    } catch (error) {
      console.error('Delete task error:', error);
      next(error);
    }
  }

  static async updateTaskStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const userId = req.user!._id;

      if (!['active', 'completed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be active or completed'
        });
      }

      // Assignee can change status
      const task = await Task.findOneAndUpdate(
        { 
          _id: req.params.id, 
          assignedTo: userId 
        },
        { status },
        { new: true, runValidators: true }
      )
      .populate('userId', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email');

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found or you are not assigned to this task'
        });
      }

      // Transform task to match frontend expectations
      const transformedTask = TaskController.transformTask(task);

      res.json({
        success: true,
        message: `Task marked as ${status}`,
        data: { task: transformedTask }
      });
    } catch (error) {
      console.error('Update task status error:', error);
      next(error);
    }
  }

  static async getTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id;
      
      const task = await Task.findOne({
        _id: req.params.id,
        $or: [
          { userId: userId },
          { assignedTo: userId }
        ]
      })
      .populate('userId', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email');

      if (!task) {
        return res.status(404).json({ 
          success: false, 
          message: 'Task not found' 
        });
      }

      // Transform task to match frontend expectations
      const transformedTask = TaskController.transformTask(task);
      
      res.json({ 
        success: true, 
        data: { task: transformedTask } 
      });
    } catch (error) {
      console.error('Get task error:', error);
      next(error);
    }
  }
}
