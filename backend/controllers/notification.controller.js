const Notification = require("../models/notification.model");
const Task = require("../models/task.model");
const groqService = require("../services/groq.service");
const smartNotificationService = require("../services/smartNotification.service");

exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, read: false });
    res.json({ notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ notification });
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    next(error);
  }
};

exports.generateDeadlineNotifications = async (req, res, next) => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);
    const now = new Date();

    const tasks = await Task.find({
      userId: req.user._id,
      deadline: { $gte: now, $lte: tomorrow },
      status: { $in: ["pending", "in-progress"] },
    });

    const notifications = [];
    for (const task of tasks) {
      try {
        const reminder = await groqService.generateSmartReminder({
          title: task.title,
          deadline: task.deadline,
          estimatedDuration: task.estimatedDuration,
          progress: task.progress,
        });

        const notification = await Notification.create({
          userId: req.user._id,
          taskId: task._id,
          title: reminder.title || "Deadline approaching",
          message: reminder.message || `${task.title} is due soon`,
          type: reminder.type || "deadline",
        });
        notifications.push(notification);
      } catch {
        const notification = await Notification.create({
          userId: req.user._id,
          taskId: task._id,
          title: "Deadline approaching",
          message: `"${task.title}" is due tomorrow. Plan your time accordingly.`,
          type: "deadline",
        });
        notifications.push(notification);
      }
    }

    res.json({ notifications });
  } catch (error) {
    next(error);
  }
};

exports.generateSmart = async (req, res, next) => {
  try {
    const notifications = await smartNotificationService.generateAndSaveSmartNotifications(req.user._id);
    res.json({ notifications });
  } catch (error) {
    next(error);
  }
};

exports.getSmart = async (req, res, next) => {
  try {
    const result = await smartNotificationService.getSmartNotifications(req.user._id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getImportantNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      userId: req.user._id,
      read: false,
      type: { $in: ["risk_alert", "rescue", "deadline"] },
    }).sort({ createdAt: -1 });

    res.json({ notifications });
  } catch (error) {
    next(error);
  }
};
