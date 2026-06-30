const Analytics = require("../models/analytics.model");
const Task = require("../models/task.model");

async function calculateDailyScore(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const tasks = await Task.find({ userId, isArchived: false });

  const completedToday = tasks.filter((t) => {
    if (t.status !== "completed") return false;
    if (!t.completedAt) return false;
    const c = new Date(t.completedAt);
    return c >= startOfDay && c <= endOfDay;
  });

  const dueToday = tasks.filter((t) => {
    if (!t.deadline) return false;
    const d = new Date(t.deadline);
    return d >= startOfDay && d <= endOfDay;
  });

  const overdue = tasks.filter((t) => {
    if (t.status === "completed") return false;
    if (!t.deadline) return false;
    return new Date(t.deadline) < startOfDay;
  });

  const completedCount = completedToday.length;
  const totalDue = dueToday.length + overdue.length;
  const completedOfDue = dueToday.filter((t) => t.status === "completed").length +
    overdue.filter((t) => t.status === "completed").length;

  const missedToday = dueToday.filter((t) => t.status === "missed").length +
    overdue.filter((t) => t.status === "missed").length;

  const pendingToday = dueToday.filter((t) => t.status === "pending" || t.status === "in-progress").length +
    overdue.filter((t) => t.status === "pending" || t.status === "in-progress").length;

  const completionRate = totalDue > 0 ? completedOfDue / totalDue : 0;
  const penalty = missedToday * 0.25;
  const score = Math.max(0, Math.min(100, Math.round(completionRate * 100 - penalty * 100)));

  const categoryBreakdown = {};
  tasks.filter((t) => t.status === "completed").forEach((t) => {
    const cat = t.category || "general";
    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
  });

  return {
    score,
    completed: completedCount,
    missed: missedToday,
    pending: pendingToday,
    total: totalDue,
    categoryBreakdown,
  };
}

async function getOrCreateDailyAnalytics(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  let analytics = await Analytics.findOne({ userId, date: startOfDay });
  if (!analytics) {
    const dailyData = await calculateDailyScore(userId, date);
    analytics = await Analytics.create({
      userId,
      date: startOfDay,
      productivityScore: dailyData.score,
      completedTasks: dailyData.completed,
      missedTasks: dailyData.missed,
      hoursWorked: 0,
      pendingTasks: dailyData.pending,
      categoryBreakdown: dailyData.categoryBreakdown,
    });
  }
  return analytics;
}

async function getWeeklyAnalytics(userId, endDate) {
  const startOfRange = new Date(endDate);
  startOfRange.setDate(startOfRange.getDate() - 7);

  return Analytics.find({
    userId,
    date: { $gte: startOfRange, $lte: endDate },
  }).sort({ date: 1 });
}

async function computeAggregates(userId) {
  const tasks = await Task.find({ userId, isArchived: false });

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const missed = tasks.filter((t) => t.status === "missed").length;
  const pending = tasks.filter((t) => t.status === "pending" || t.status === "in-progress").length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const priorityDist = { high: { total: 0, completed: 0 }, medium: { total: 0, completed: 0 }, low: { total: 0, completed: 0 } };
  tasks.forEach((t) => {
    const p = t.priority || "medium";
    if (!priorityDist[p]) priorityDist[p] = { total: 0, completed: 0 };
    priorityDist[p].total++;
    if (t.status === "completed") priorityDist[p].completed++;
  });

  const categoryData = {};
  tasks.forEach((t) => {
    const cat = t.category || "general";
    if (!categoryData[cat]) categoryData[cat] = { total: 0, completed: 0, missed: 0 };
    categoryData[cat].total++;
    if (t.status === "completed") categoryData[cat].completed++;
    if (t.status === "missed") categoryData[cat].missed++;
  });

  const riskTrend = tasks
    .filter((t) => t.riskScore > 0)
    .sort((a, b) => a.deadline - b.deadline)
    .slice(0, 20)
    .map((t) => ({
      title: t.title.length > 20 ? t.title.slice(0, 20) + "..." : t.title,
      riskScore: t.riskScore,
      deadline: t.deadline,
    }));

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ana = await Analytics.findOne({ userId, date: d });
    if (ana && ana.productivityScore >= 50) {
      streak++;
    } else {
      break;
    }
  }

  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekTasks = tasks.filter((t) => t.completedAt && new Date(t.completedAt) >= weekAgo);
  const hoursByDay = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-US", { weekday: "short" });
    hoursByDay[key] = 0;
  }
  weekTasks.forEach((t) => {
    if (t.completedAt && t.estimatedDuration) {
      const key = new Date(t.completedAt).toLocaleDateString("en-US", { weekday: "short" });
      if (hoursByDay[key] !== undefined) {
        hoursByDay[key] += t.estimatedDuration / 60;
      }
    }
  });

  const bestDay = Object.entries(hoursByDay).sort((a, b) => b[1] - a[1])[0];

  return {
    totalTasks: total,
    completedTasks: completed,
    missedTasks: missed,
    pendingTasks: pending,
    completionRate,
    priorityDist,
    categoryData,
    riskTrend,
    streak,
    hoursByDay,
    bestDay: bestDay ? { day: bestDay[0], hours: Math.round(bestDay[1] * 10) / 10 } : null,
  };
}

module.exports = { calculateDailyScore, getOrCreateDailyAnalytics, getWeeklyAnalytics, computeAggregates };
