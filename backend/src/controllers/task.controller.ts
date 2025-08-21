import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Task from '../models/Task.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class TaskController {
  static async getTasks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status, priority, search } = req.query;
      const filter: any = { userId: req.user!._id };

      if (status && status !== 'all') filter.status = status;
      if (priority && priority !== 'all') filter.priority = priority;
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      const tasks = await Task.find(filter).sort({ createdAt: -1 });
      res.json({ success: true, data: { tasks } });
    } catch (error) {
      next(error);
    }
  }

  static async createTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const task = new Task({ ...req.body, userId: req.user!._id });
      await task.save();
      res.status(201).json({ success: true, data: { task } });
    } catch (error) {
      next(error);
    }
  }

  static async getTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const task = await Task.findOne({ _id: req.params.id, userId: req.user!._id });
      if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }
      res.json({ success: true, data: { task } });
    } catch (error) {
      next(error);
    }
  }

  static async updateTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const task = await Task.findOneAndUpdate(
        { _id: req.params.id, userId: req.user!._id },
        req.body,
        { new: true }
      );

      if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }

      res.json({ success: true, data: { task } });
    } catch (error) {
      next(error);
    }
  }

  static async deleteTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user!._id });
      if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }
      res.json({ success: true, message: 'Task deleted' });
    } catch (error) {
      next(error);
    }
  }

  static async updateTaskStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const task = await Task.findOneAndUpdate(
        { _id: req.params.id, userId: req.user!._id },
        { status },
        { new: true }
      );

      if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }

      res.json({ success: true, data: { task } });
    } catch (error) {
      next(error);
    }
  }
}