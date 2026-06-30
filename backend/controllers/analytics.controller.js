const analyticsService = require("../services/analytics.service");
const Task = require("../models/task.model");
const CalendarEvent = require("../models/calendarEvent.model");

exports.getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const [
      todayTasks,
      upcomingDeadlines,
      highRiskTasks,
      weeklyAnalytics,
      todayEvents,
    ] = await Promise.all([
      Task.find({ userId: req.user._id, createdAt: { $gte: today, $lte: endOfToday } }),
      Task.find({ userId: req.user._id, deadline: { $gte: today }, status: { $ne: "completed" } })
        .sort({ deadline: 1 })
        .limit(5),
      Task.find({ userId: req.user._id, riskScore: { $gte: 70 }, status: { $in: ["pending", "in-progress"] } })
        .sort({ riskScore: -1 })
        .limit(5),
      analyticsService.getWeeklyAnalytics(req.user._id, endOfToday),
      CalendarEvent.find({ userId: req.user._id, start: { $gte: today, $lte: endOfToday } }).sort({ start: 1 }),
    ]);

    const dailyAnalytics = await analyticsService.getOrCreateDailyAnalytics(req.user._id, today);

    res.json({
      todayTasks: todayTasks.length,
      upcomingDeadlines,
      highRiskTasks,
      productivityScore: dailyAnalytics.productivityScore,
      weeklyAnalytics,
      todayEvents,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [dailyAnalytics, tasks, events] = await Promise.all([
      analyticsService.getWeeklyAnalytics(req.user._id, end),
      Task.find({ userId: req.user._id, createdAt: { $gte: start, $lte: end } }),
      CalendarEvent.find({ userId: req.user._id, start: { $gte: start, $lte: end } }),
    ]);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const missedTasks = tasks.filter((t) => t.status === "missed").length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const categoryData = {};
    tasks.forEach((t) => {
      const cat = t.category || "general";
      if (!categoryData[cat]) categoryData[cat] = { total: 0, completed: 0 };
      categoryData[cat].total++;
      if (t.status === "completed") categoryData[cat].completed++;
    });

    const totalFocusHours = events
      .filter((e) => e.isWorkSession)
      .reduce((sum, e) => sum + (new Date(e.end) - new Date(e.start)) / 3600000, 0);

    res.json({
      totalTasks,
      completedTasks,
      missedTasks,
      completionRate,
      totalFocusHours: Math.round(totalFocusHours * 10) / 10,
      categoryData,
      dailyAnalytics,
    });
  } catch (error) {
    next(error);
  }
};
