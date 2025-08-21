import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/User.model';

export class AuthController {
  // Generate tokens helper - make it private static
  private static generateTokens(userId: string) {
    const accessToken = jwt.sign(
      { userId },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { firstName, lastName, email, password } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      const user = new User({ firstName, lastName, email, password });
      await user.save();

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user._id.toString(),
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            createdAt: user.createdAt
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      // Use AuthController.generateTokens() instead of this.generateTokens()
      const { accessToken, refreshToken } = AuthController.generateTokens(user._id.toString());

      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id.toString(),
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
          },
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token not provided'
        });
      }

      try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
        
        const user = await User.findById(decoded.userId);
        if (!user || !user.isActive) {
          return res.status(401).json({
            success: false,
            message: 'Invalid refresh token'
          });
        }

        // Use AuthController.generateTokens() instead of this.generateTokens()
        const { accessToken, refreshToken: newRefreshToken } = AuthController.generateTokens(user._id.toString());

        // Set new refresh token as cookie
        res.cookie('refreshToken', newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
          success: true,
          data: {
            accessToken,
            refreshToken: newRefreshToken,
            user: {
              id: user._id.toString(),
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email
            }
          }
        });
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token'
        });
      }
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // Clear refresh token cookie
      res.clearCookie('refreshToken');
      
      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCurrentUser(req: any, res: Response, next: NextFunction) {
    try {
      const user = req.user;

      res.json({
        success: true,
        data: {
          user: {
            id: user._id.toString(),
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            createdAt: user.createdAt
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
