const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/user.model");
const { sendPasswordResetEmail } = require("../services/email.service");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
};

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      message: "Registration successful",
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    res.json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account with that email" });
    }
    const resetToken = jwt.sign({ id: user._id, purpose: "reset" }, process.env.JWT_SECRET, { expiresIn: "1h" });
    await sendPasswordResetEmail(user.email, resetToken);
    res.json({ message: "Password reset link sent to your email" });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.purpose !== "reset") {
      return res.status(400).json({ message: "Invalid reset token" });
    }
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.password = password;
    await user.save();
    res.json({ message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
};

exports.demoLogin = async (req, res, next) => {
  try {
    const User = require("../models/user.model");
    const user = await User.findOne({ email: "googledev@duepilot.com" });
    if (!user) {
      return res.status(404).json({ message: "Demo account not found. Run seed script first." });
    }
    const token = generateToken(user._id);
    res.json({ message: "Demo login successful", token, user });
  } catch (error) {
    next(error);
  }
};

exports.deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;
    await Promise.all([
      require("../models/task.model").deleteMany({ userId }),
      require("../models/subtask.model").deleteMany({}),
      require("../models/goal.model").deleteMany({ userId }),
      require("../models/analytics.model").deleteMany({ userId }),
      require("../models/notification.model").deleteMany({ userId }),
      require("../models/calendarEvent.model").deleteMany({ userId }),
      require("../models/actionLog.model").deleteMany({ userId }),
      require("../models/studyPlan.model").deleteMany({ userId }),
      User.findByIdAndDelete(userId),
    ]);
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const allowedUpdates = ["name", "timezone", "avatar", "bio", "theme", "dailyGoal", "weeklyGoal", "preferredStudyTime", "defaultView", "notificationPreferences", "focusPreferences"];
    const updates = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ message: "Profile updated", user });
  } catch (error) {
    next(error);
  }
};
