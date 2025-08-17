const express = require('express');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const userCtrl = require('../controllers/userController');

const router = express.Router();

// Admin-only list users
router.get('/', authenticate, authorizeRoles('admin'), userCtrl.listUsers);

// Get/update/delete: admin or self (implement check in route)
router.get('/:id', authenticate, userCtrl.getUser);

router.put('/:id', authenticate, userCtrl.updateUser);

router.delete('/:id', authenticate, authorizeRoles('admin'), userCtrl.deleteUser);

router.post('/change-password', authenticate, userCtrl.changePassword);

module.exports = router;
