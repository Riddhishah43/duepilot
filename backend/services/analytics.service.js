const Analytics = require("../models/analytics.model");
const Task = require("../models/task.model");

async function calculateDailyScore(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const tasks = await Task.find({
    userId,
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });

  const completed = tasks.filter((t) => t.status === "completed").length;
  const total = tasks.length || 1;
  const missed = tasks.filter((t) => t.status === "missed").length;

  const completionRate = completed / total;
  const penalty = missed * 0.2;
  const score = Math.max(0, Math.min(100, Math.round(completionRate * 100 - penalty * 100)));

  const categoryBreakdown = {};
  tasks.forEach((task) => {
    const cat = task.category || "general";
    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
  });

  return { score, completed, missed, total, categoryBreakdown };
}

async function getOrCreateDailyAnalytics(userId, date) {
  let analytics = await Analytics.findOne({ userId, date });
  if (!analytics) {
    const dailyData = await calculateDailyScore(userId, date);
    analytics = await Analytics.create({
      userId,
      date,
      ...dailyData,
    });
  }
  return analytics;
}

async function getWeeklyAnalytics(userId, endDate) {
  const startOfWeek = new Date(endDate);
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  return Analytics.find({
    userId,
    date: { $gte: startOfWeek, $lte: endDate },
  }).sort({ date: 1 });
}

module.exports = { calculateDailyScore, getOrCreateDailyAnalytics, getWeeklyAnalytics };
