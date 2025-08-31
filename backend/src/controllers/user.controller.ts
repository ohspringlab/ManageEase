import { Response, NextFunction } from 'express';
import User from '../models/User.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class UserController {
  // Helper function to transform user data
  private static transformUser(user: any) {
    return {
      id: user._id.toString(), // Convert _id to id
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      createdAt: user.createdAt,
      lastActivity: user.lastActivity
    };
  }

  // Get all users for task assignment
  static async getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { search } = req.query;
      const filter: any = { isActive: true };

      if (search) {
        filter.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      const users = await User.find(filter)
        .select('firstName lastName email createdAt')
        .limit(20)
        .sort({ firstName: 1 });

      // Transform users to match frontend expectations
      const transformedUsers = users.map(user => UserController.transformUser(user));

      res.json({
        success: true,
        data: { users: transformedUsers }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user profile by ID
  static async getUserById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.params.id)
        .select('firstName lastName email createdAt');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Transform user to match frontend expectations
      const transformedUser = UserController.transformUser(user);

      res.json({
        success: true,
        data: { user: transformedUser }
      });
    } catch (error) {
      next(error);
    }
  }
}
