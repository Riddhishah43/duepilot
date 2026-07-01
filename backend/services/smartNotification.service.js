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

    let rawNotifications = [];

    try {
      const aiResult = await groqService.generateSmartNotifications(tasksData, userData, patterns);
      if (aiResult.notifications && Array.isArray(aiResult.notifications) && aiResult.notifications.length > 0) {
        rawNotifications = aiResult.notifications;
      }
    } catch (err) {
      console.warn("AI smart notification failed, using fallback:", err.message);
    }

    if (rawNotifications.length === 0) {
      rawNotifications = generateFallbackNotifications(tasks, patterns);
    }

    const savedNotifications = [];

    for (const n of rawNotifications) {
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

function generateFallbackNotifications(tasks, patterns) {
  const notifications = [];
  const now = new Date();
  const { completedToday, totalActiveTasks, currentHour, todayLogCount, missedTaskCount } = patterns;

  const urgentTasks = tasks.filter((t) => {
    if (t.status === "completed" || !t.deadline) return false;
    const diff = (new Date(t.deadline) - now) / 86400000;
    return diff >= 0 && diff <= 2;
  }).slice(0, 2);

  for (const task of urgentTasks) {
    const diff = Math.round((new Date(task.deadline) - now) / 86400000);
    notifications.push({
      subtype: "start_now",
      title: task.progress >= 50 ? `${task.title} — finish strong!` : `Start ${task.title} now`,
      message: `Due ${diff === 0 ? "today" : `in ${diff} days`}${task.progress ? ` (${task.progress}% done)` : ""}. ${task.progress >= 50 ? "The finish line is close!" : "Open the task and begin."}`,
      priority: 80 + Math.max(0, 10 - diff),
      taskId: task._id,
      actionUrl: "/tasks",
    });
  }

  const missedTasks = tasks.filter((t) => t.status === "missed").slice(0, 1);
  for (const task of missedTasks) {
    notifications.push({
      subtype: "missed",
      title: `Missed: ${task.title}`,
      message: "This task was missed. Would you like to reschedule or reprioritize it?",
      priority: 70,
      taskId: task._id,
      actionUrl: "/tasks",
    });
  }

  const peakHours = [6, 7, 8, 9, 10, 11, 13, 14, 15, 16];
  if (peakHours.includes(currentHour) && totalActiveTasks > 0) {
    notifications.push({
      subtype: "best_time",
      title: "Peak productivity time",
      message: `It's ${currentHour < 12 ? "morning" : "afternoon"} — your most productive window. Tackle a high-priority task now.`,
      priority: 65,
      taskId: null,
      actionUrl: "/tasks",
    });
  }

  if (todayLogCount === 0 && totalActiveTasks > 0) {
    notifications.push({
      subtype: "focus",
      title: "No activity yet today",
      message: "You haven't logged any actions today. A short 25-minute focus session can get things rolling.",
      priority: 60,
      taskId: null,
      actionUrl: "/focus",
    });
  }

  if (totalActiveTasks > 8) {
    notifications.push({
      subtype: "overload",
      title: `${totalActiveTasks} active tasks`,
      message: `You have ${totalActiveTasks} active tasks. Consider deferring or breaking down less urgent ones.`,
      priority: 50,
      taskId: null,
      actionUrl: "/tasks",
    });
  }

  if (completedToday > 0) {
    notifications.push({
      subtype: "reinforcement",
      title: completedToday >= 3 ? "Great progress today!" : `${completedToday} task${completedToday > 1 ? "s" : ""} done`,
      message: completedToday >= 3
        ? `You completed ${completedToday} tasks today. Keep up the momentum!`
        : `You completed ${completedToday} task${completedToday > 1 ? "s" : ""} today. Check off a few more to stay ahead.`,
      priority: 40,
      taskId: null,
      actionUrl: "/tasks",
    });
  }

  const atRisk = tasks.filter((t) => {
    if (t.status === "completed" || !t.deadline) return false;
    const diff = (new Date(t.deadline) - now) / 86400000;
    return diff >= 0 && diff <= 5 && (t.progress || 0) < 30;
  }).slice(0, 1);

  for (const task of atRisk) {
    if (!notifications.some((n) => n.taskId === task._id)) {
      notifications.push({
        subtype: "prediction",
        title: `${task.title} may be at risk`,
        message: `Only ${task.progress || 0}% complete with limited time remaining. Try breaking it into smaller steps.`,
        priority: 75,
        taskId: task._id,
        actionUrl: "/tasks",
      });
    }
  }

  return notifications.slice(0, 8);
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
