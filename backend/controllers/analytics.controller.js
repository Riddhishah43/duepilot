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
      Task.find({ userId: req.user._id, deadline: { $gte: today, $lte: endOfToday }, status: { $ne: "completed" } }),
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

    const [dailyAnalytics, aggregates] = await Promise.all([
      analyticsService.getWeeklyAnalytics(req.user._id, end),
      analyticsService.computeAggregates(req.user._id),
    ]);

    res.json({ ...aggregates, dailyAnalytics });
  } catch (error) {
    next(error);
  }
};
