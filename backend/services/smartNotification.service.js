const Task = require("../models/task.model");
const Notification = require("../models/notification.model");
const ActionLog = require("../models/actionLog.model");
const groqService = require("./groq.service");

async function generateAndSaveSmartNotifications(userId) {
  try {
    const tasks = await Task.find({
      userId,
      isArchived: false,
    }).sort({ deadline: 1 });

    if (tasks.length === 0) return [];

    const now = new Date();

    const tasksData = tasks.map((t) => ({
      title: t.title,
      description: t.description?.slice(0, 100),
      deadline: t.deadline,
      estimatedDuration: t.estimatedDuration,
      priority: t.priority,
      progress: t.progress,
      category: t.category,
      status: t.status,
      riskScore: t.riskScore,
      daysUntilDeadline: t.deadline ? Math.round((new Date(t.deadline) - now) / 86400000) : null,
    }));

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const logs = await ActionLog.find({ userId, createdAt: { $gte: thirtyDaysAgo } })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const todayLogs = logs.filter((l) => {
      const d = new Date(l.createdAt);
      return d.toDateString() === now.toDateString();
    });

    const hour = now.getHours();
    const todayStr = now.toLocaleDateString("en-US", { weekday: "long" });

    const completedToday = tasks.filter((t) => {
      if (t.status !== "completed" || !t.completedAt) return false;
      return new Date(t.completedAt).toDateString() === now.toDateString();
    });

    const missedBefore = tasks.filter((t) => t.status === "missed");

    const patterns = {
      completedToday: completedToday.length,
      totalActiveTasks: tasks.filter((t) => t.status !== "completed").length,
      currentHour: hour,
      todayLogCount: todayLogs.length,
      todayStr,
      missedTaskCount: missedBefore.length,
    };

    const userData = {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    const aiResult = await groqService.generateSmartNotifications(tasksData, userData, patterns);

    const savedNotifications = [];

    if (aiResult.notifications && Array.isArray(aiResult.notifications)) {
      for (const n of aiResult.notifications) {
        const notif = await Notification.create({
          userId,
          title: n.title,
          message: n.message,
          type: "smart",
          subtype: n.subtype || "general",
          taskId: n.taskId || undefined,
          actionUrl: n.actionUrl || undefined,
          priority: n.priority || 0,
        });
        savedNotifications.push(notif);
      }
    }

    await Notification.updateMany(
      { userId, type: { $ne: "smart" } },
      { $set: { priority: -1 } }
    );

    return savedNotifications;
  } catch (error) {
    console.error("Smart notification error:", error.message);
    return [];
  }
}

async function getSmartNotifications(userId) {
  const notifications = await Notification.find({ userId, type: "smart" })
    .sort({ priority: -1, createdAt: -1 })
    .limit(20);
  const unreadCount = await Notification.countDocuments({
    userId,
    $or: [
      { type: "smart", read: false },
      { type: { $in: ["deadline", "risk_alert", "rescue"] }, read: false },
    ],
  });
  return { notifications, unreadCount };
}

module.exports = { generateAndSaveSmartNotifications, getSmartNotifications };
