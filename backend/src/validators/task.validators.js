import { body } from 'express-validator';

export const upsertTaskRules = [
  body('title').notEmpty(),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  body('status').optional().isIn(['to_do', 'in_progress', 'completed']).withMessage('Invalid status'),
  body('dueDate').optional().isISO8601().toDate(),
  body('assignee').optional().isMongoId()
];