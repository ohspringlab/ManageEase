const User = require('../models/User');

// Admin: list users with optional search, pagination
exports.listUsers = async (req, res) => {
  const { page = 1, limit = 20, q } = req.query;
  const filter = q ? { $or: [{name: new RegExp(q,'i')}, {email: new RegExp(q,'i')}] } : {};
  const users = await User.find(filter).skip((page-1)*limit).limit(Number(limit)).select('-password');
  const count = await User.countDocuments(filter);
  res.json({ users, total: count, page: Number(page) });
};

exports.getUser = async (req, res) => {
  try {
    // only self or admin allowed
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updates = req.body;
    if (updates.password) delete updates.password; // password change via separate route

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  if (!await user.comparePassword(currentPassword)) return res.status(400).json({ message: 'Incorrect password' });
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password changed' });
};
