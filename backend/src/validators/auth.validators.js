import { body } from 'express-validator';

export const registerRules = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Min 6 characters')
];

export const loginRules = [
  body('email').isEmail(),
  body('password').notEmpty()
];