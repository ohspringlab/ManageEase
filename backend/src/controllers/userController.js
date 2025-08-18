const Task = require("../models/Task");
const User = require("../models/User");

// Admin: list users with optional search, pagination
exports.listUsers = async (req, res) => {
  const { page = 1, limit = 20, q } = req.query;
  const filter = q
    ? { $or: [{ name: new RegExp(q, "i") }, { email: new RegExp(q, "i") }] }
    : {};
  const users = await User.find(filter)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .select("-password");
  const count = await User.countDocuments(filter);
  res.json({ users, total: count, page: Number(page) });
};

exports.getUser = async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id.toString()) {
      return res
        .status(403)
        .json({ message: "Forbidden: You can only view your own profile" });
    }

    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const tasksCompleted = await Task.countDocuments({
      assignedTo: req.params.id,
      status: "completed",
    });

    const activeTasks = await Task.countDocuments({
      assignedTo: req.params.id,
      status: { $ne: "completed" }, // all not completed = active
    });

    res.json({
      ...user.toObject(),
      tasksCompleted,
      activeTasks,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id.toString()) {
      return res
        .status(403)
        .json({ message: "Forbidden: You can only update your own profile" });
    }

    const updates = req.body;
    if (updates.password) delete updates.password; // password change via separate route

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteUser = async (req, res) => {
  if (req.user._id.toString() !== req.params.id.toString()) {
    return res
      .status(403)
      .json({ message: "Forbidden: You can only delete your own account" });
  }
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Make sure user exists
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
