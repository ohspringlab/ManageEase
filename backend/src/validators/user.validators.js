import { body } from 'express-validator';

export const updateProfileRules = [
  body('name').optional().notEmpty(),
  body('email').optional().isEmail(),
];

export const changePasswordRules = [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
];