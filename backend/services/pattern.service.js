const ActionLog = require("../models/actionLog.model");
const Task = require("../models/task.model");
const groqService = require("./groq.service");

async function logAction(userId, action, task, extra = {}) {
  try {
    const now = new Date();
    await ActionLog.create({
      userId,
      taskId: task._id,
      action,
      taskTitle: task.title,
      category: task.category || "general",
      priority: task.priority,
      deadline: task.deadline,
      estimatedDuration: task.estimatedDuration,
      progress: task.progress,
      hourOfDay: now.getHours(),
      dayOfWeek: now.toLocaleDateString("en-US", { weekday: "long" }),
      ...extra,
    });
  } catch (err) {
    console.error("Action log error:", err.message);
  }
}

async function getPatternInsights(userId) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [logs, tasks] = await Promise.all([
    ActionLog.find({ userId, createdAt: { $gte: thirtyDaysAgo } }).sort({ createdAt: -1 }).lean(),
    Task.find({ userId, isArchived: false }).lean(),
  ]);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const missed = tasks.filter((t) => t.status === "missed").length;
  const pending = tasks.filter((t) => t.status === "pending" || t.status === "in-progress").length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const categoryStats = {};
  tasks.forEach((t) => {
    const cat = t.category || "general";
    if (!categoryStats[cat]) categoryStats[cat] = { total: 0, completed: 0, missed: 0, rescheduled: 0 };
    categoryStats[cat].total++;
    if (t.status === "completed") categoryStats[cat].completed++;
    if (t.status === "missed") categoryStats[cat].missed++;
  });

  const rescheduleCounts = {};
  logs.filter((l) => l.action === "task_rescheduled").forEach((l) => {
    const cat = l.category || "general";
    rescheduleCounts[cat] = (rescheduleCounts[cat] || 0) + 1;
  });
  Object.keys(rescheduleCounts).forEach((cat) => {
    if (categoryStats[cat]) categoryStats[cat].rescheduled = rescheduleCounts[cat];
  });

  const hourBuckets = {};
  logs.filter((l) => l.action === "task_completed").forEach((l) => {
    const h = l.hourOfDay;
    const bucket = `${h}:00`;
    hourBuckets[bucket] = (hourBuckets[bucket] || 0) + 1;
  });

  const dayBuckets = {};
  logs.filter((l) => l.action === "task_completed").forEach((l) => {
    const d = l.dayOfWeek;
    dayBuckets[d] = (dayBuckets[d] || 0) + 1;
  });

  const taskStats = {
    totalTasks: total,
    completedTasks: completed,
    missedTasks: missed,
    pendingTasks: pending,
    completionRate,
    categoryStats,
    rescheduleCounts,
    completionByHour: hourBuckets,
    completionByDay: dayBuckets,
  };

  const maxLogs = logs.slice(0, 100);
  let aiResult;
  try {
    aiResult = await groqService.analyzePatterns(maxLogs, taskStats);
  } catch (err) {
    const bestCategory = Object.entries(categoryStats).sort((a, b) => b[1].completed - a[1].completed)[0]?.[0] || "general";
    const worstCategory = Object.entries(categoryStats).sort((a, b) => (a[1].missed / (a[1].total || 1)) - (b[1].missed / (b[1].total || 1)))[0]?.[0] || "general";
    const bestHour = Object.entries(hourBuckets).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
    const bestDay = Object.entries(dayBuckets).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    aiResult = {
      bestProductiveHour: bestHour,
      bestProductiveDay: bestDay,
      strongestCategory: bestCategory,
      weakestCategory: worstCategory,
      insightSummary: `You've completed ${completed}/${total} tasks (${completionRate}%). Best category: ${bestCategory}. Most productive at ${bestHour} on ${bestDay}.`,
      recommendations: [
        { type: "focus", title: `Start with ${bestCategory} tasks during your peak at ${bestHour}`, detail: "Align your hardest work with your most productive hours." },
        { type: "improve", title: `Review ${worstCategory} tasks to reduce missed deadlines`, detail: "Break down larger tasks and set earlier internal deadlines." },
        completed < total ? { type: "catch-up", title: `Focus on completing ${pending} pending tasks`, detail: "Prioritize overdue tasks first using Rescue Mode." } : null,
        { type: "maintain", title: "Log your work consistently", detail: "More action logs improve future AI insights." },
      ].filter(Boolean),
    };
  }

  return {
    analysis: aiResult,
    stats: taskStats,
    logCount: logs.length,
  };
}

module.exports = { logAction, getPatternInsights };
