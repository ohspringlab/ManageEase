const express = require('express');
const { authenticate } = require('../middleware/auth');
const taskCtrl = require('../controllers/taskController');

const router = express.Router();

router.post('/', authenticate, taskCtrl.createTask);
router.get('/', authenticate, taskCtrl.listTasks);
router.get('/:id', authenticate, taskCtrl.getTask);
router.put('/:id', authenticate, taskCtrl.updateTask);
router.delete('/:id', authenticate, taskCtrl.deleteTask);

module.exports = router;
