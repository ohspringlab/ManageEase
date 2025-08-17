const Task = require('../models/Task');

exports.createTask = async (req, res) => {
  const { title, description, priority, status, dueDate, assignedTo } = req.body;
  const createdBy = req.user._id;
  // Regular users should only be allowed to assign to themselves (validate in route or here)
  if (req.user.role !== 'admin' && assignedTo && assignedTo.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Cannot assign tasks to others' });
  }
  const task = await Task.create({ title, description, priority, status, dueDate, assignedTo: assignedTo || req.user._id, createdBy });
  res.status(201).json(task);
};

exports.listTasks = async (req, res) => {
  const { page = 1, limit = 20, q, status, priority, assignedTo, sortBy = 'dueDate', order = 'asc' } = req.query;
  const filter = {};
  if (q) filter.title = new RegExp(q, 'i');
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignedTo) filter.assignedTo = assignedTo;

  // Regular users only see their own tasks
  if (req.user.role !== 'admin') filter.assignedTo = req.user._id;

  const tasks = await Task.find(filter)
    .populate('assignedTo', 'name email')
    .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
    .skip((page-1)*limit)
    .limit(Number(limit));
  const total = await Task.countDocuments(filter);
  res.json({ tasks, total, page: Number(page) });
};

exports.getTask = async (req, res) => {
  const task = await Task.findById(req.params.id).populate('assignedTo', 'name email');
  if (!task) return res.status(404).json({ message: 'Task not found' });
  if (req.user.role !== 'admin' && task.assignedTo._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  res.json(task);
};

exports.updateTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  if (req.user.role !== 'admin' && task.assignedTo.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  Object.assign(task, req.body);
  await task.save();
  res.json(task);
};

exports.deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  if (req.user.role !== 'admin' && task.assignedTo.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  await task.remove();
  res.json({ message: 'Task deleted' });
};
